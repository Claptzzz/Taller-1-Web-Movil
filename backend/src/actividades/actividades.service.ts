import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

@Injectable()
export class ActividadesService {
  constructor(private prisma: PrismaService) {}

  private parseFecha(fecha: any): Date {
    if (fecha === undefined || fecha === null || fecha === '') {
      throw new BadRequestException('La fecha es requerida');
    }
    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestException('La fecha no es válida');
    }
    dateObj.setUTCHours(0, 0, 0, 0);
    return dateObj;
  }

  private validarDescripcion(descripcion: any) {
    if (typeof descripcion !== 'string' || descripcion.trim() === '') {
      throw new BadRequestException('La descripción es requerida');
    }
  }

  private validarHora(hora: any) {
    if (typeof hora !== 'string' || !HORA_REGEX.test(hora)) {
      throw new BadRequestException('La hora debe tener formato HH:MM (00:00 a 23:59)');
    }
  }

  // Devuelve {lat, lng} validados, o null si no se envió ubicación.
  private validarUbicacion(lat: any, lng: any): { lat: number; lng: number } | null {
    const tieneLat = lat !== undefined && lat !== null;
    const tieneLng = lng !== undefined && lng !== null;

    if (!tieneLat && !tieneLng) return null;
    if (tieneLat !== tieneLng) {
      throw new BadRequestException(
        'La ubicación requiere latitud y longitud juntas; envía ambas o ninguna',
      );
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      throw new BadRequestException('La latitud y la longitud deben ser números');
    }
    if (latNum < -90 || latNum > 90) {
      throw new BadRequestException('La latitud debe estar entre -90 y 90');
    }
    if (lngNum < -180 || lngNum > 180) {
      throw new BadRequestException('La longitud debe estar entre -180 y 180');
    }
    return { lat: latNum, lng: lngNum };
  }

  async create(userId: string, data: any) {
    const { descripcion, hora, fecha, lat, lng } = data;

    this.validarDescripcion(descripcion);
    this.validarHora(hora);
    const fechaObj = this.parseFecha(fecha);
    const ubicacion = this.validarUbicacion(lat, lng);

    const actividad = await this.prisma.actividad.create({
      data: {
        idUsuario: userId,
        descripcion: descripcion.trim(),
        hora,
        fecha: fechaObj,
        ...(ubicacion ?? {}),
      },
    });

    return {
      mensaje: 'Actividad creada con éxito',
      actividad,
    };
  }

  async findAll(userId: string, fecha?: string) {
    const where: any = { idUsuario: userId };
    if (fecha) {
      where.fecha = this.parseFecha(fecha);
    }
    return this.prisma.actividad.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
  }

  async getCalendario(userId: string) {
    const actividades = await this.prisma.actividad.findMany({
      where: { idUsuario: userId },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });

    const agrupadas: Record<
      string,
      { id: number; descripcion: string; hora: string; lat: number | null; lng: number | null }[]
    > = {};
    for (const act of actividades) {
      const key = act.fecha.toISOString().slice(0, 10);
      if (!agrupadas[key]) agrupadas[key] = [];
      agrupadas[key].push({
        id: act.id,
        descripcion: act.descripcion,
        hora: act.hora,
        lat: act.lat,
        lng: act.lng,
      });
    }
    return agrupadas;
  }

  async findOne(userId: string, id: number) {
    const actividad = await this.prisma.actividad.findUnique({ where: { id } });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    if (actividad.idUsuario !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a esta actividad');
    }
    return actividad;
  }

  async update(userId: string, id: number, data: any) {
    await this.findOne(userId, id);

    const { descripcion, hora, fecha, lat, lng } = data;
    const updateData: any = {};

    if (descripcion !== undefined) {
      this.validarDescripcion(descripcion);
      updateData.descripcion = descripcion.trim();
    }
    if (hora !== undefined) {
      this.validarHora(hora);
      updateData.hora = hora;
    }
    if (fecha !== undefined) {
      updateData.fecha = this.parseFecha(fecha);
    }
    if (lat !== undefined || lng !== undefined) {
      const ubicacion = this.validarUbicacion(lat, lng);
      if (ubicacion) {
        updateData.lat = ubicacion.lat;
        updateData.lng = ubicacion.lng;
      }
    }

    const actividad = await this.prisma.actividad.update({
      where: { id },
      data: updateData,
    });

    return {
      mensaje: 'Actividad actualizada con éxito',
      actividad,
    };
  }

  async remove(userId: string, id: number) {
    await this.findOne(userId, id);
    await this.prisma.actividad.delete({ where: { id } });
    return { mensaje: 'Actividad eliminada' };
  }
}
