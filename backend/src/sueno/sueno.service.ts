import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const CALIDADES = ['ALTA', 'MEDIA', 'BAJA'] as const;
type Calidad = (typeof CALIDADES)[number];

@Injectable()
export class SuenoService {
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

  private validarHoraStr(hora: any, campo: string) {
    if (typeof hora !== 'string' || !HORA_REGEX.test(hora)) {
      throw new BadRequestException(`${campo} debe tener formato HH:MM (00:00 a 23:59)`);
    }
  }

  private horaAHoras(hhmm: string): number {
    const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10));
    return h + m / 60;
  }

  private calcularHorasDormidas(horaInicio: string, horaFin: string): number {
    this.validarHoraStr(horaInicio, 'horaInicio');
    this.validarHoraStr(horaFin, 'horaFin');
    let total = this.horaAHoras(horaFin) - this.horaAHoras(horaInicio);
    if (total < 0) total += 24;
    return parseFloat(total.toFixed(1));
  }

  private validarHorasDormidas(horas: any): number {
    if (typeof horas !== 'number' || isNaN(horas) || horas < 0 || horas > 24) {
      throw new BadRequestException('horasDormidas debe ser un número entre 0 y 24');
    }
    return horas;
  }

  private normalizarCalidad(calidad: any, horasDormidas: number): Calidad {
    if (calidad === undefined || calidad === null || calidad === '') {
      if (horasDormidas >= 8) return 'ALTA';
      if (horasDormidas >= 6) return 'MEDIA';
      return 'BAJA';
    }
    if (typeof calidad !== 'string') {
      throw new BadRequestException('calidadSueno debe ser ALTA, MEDIA o BAJA');
    }
    const upper = calidad.toUpperCase() as Calidad;
    if (!CALIDADES.includes(upper)) {
      throw new BadRequestException('calidadSueno debe ser ALTA, MEDIA o BAJA');
    }
    return upper;
  }

  async create(userId: string, data: any) {
    const { horasDormidas, horaInicio, horaFin, calidadSueno, fechaSueno } = data;

    const fechaObj = this.parseFecha(fechaSueno);

    let horas: number;
    if (horasDormidas !== undefined && horasDormidas !== null && horasDormidas !== '') {
      horas = this.validarHorasDormidas(
        typeof horasDormidas === 'string' ? parseFloat(horasDormidas) : horasDormidas,
      );
    } else if (horaInicio !== undefined && horaFin !== undefined) {
      horas = this.calcularHorasDormidas(horaInicio, horaFin);
      this.validarHorasDormidas(horas);
    } else {
      throw new BadRequestException(
        'Debes enviar horasDormidas o el par horaInicio/horaFin',
      );
    }

    const calidad = this.normalizarCalidad(calidadSueno, horas);

    const sueno = await this.prisma.sueno.create({
      data: {
        idUsuario: userId,
        horasDormidas: horas,
        calidadSueno: calidad,
        fechaSueno: fechaObj,
      },
    });

    return {
      mensaje: 'Registro de sueño creado con éxito',
      sueno,
    };
  }

  async findAll(userId: string, fecha?: string) {
    const where: any = { idUsuario: userId };
    if (fecha) {
      where.fechaSueno = this.parseFecha(fecha);
    }
    return this.prisma.sueno.findMany({
      where,
      orderBy: { fechaSueno: 'asc' },
    });
  }

  async getSemana(userId: string) {
    const hoy = new Date();
    const offset = (hoy.getUTCDay() + 6) % 7;
    const lunes = new Date(
      Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - offset),
    );
    lunes.setUTCHours(0, 0, 0, 0);
    const domingo = new Date(lunes);
    domingo.setUTCDate(domingo.getUTCDate() + 6);
    domingo.setUTCHours(23, 59, 59, 999);

    const registros = await this.prisma.sueno.findMany({
      where: {
        idUsuario: userId,
        fechaSueno: { gte: lunes, lte: domingo },
      },
      orderBy: { id: 'asc' },
    });

    const dias = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const horas = [0, 0, 0, 0, 0, 0, 0];
    const calidades = ['MEDIA', 'MEDIA', 'MEDIA', 'MEDIA', 'MEDIA', 'MEDIA', 'MEDIA'];
    for (const r of registros) {
      const idx = (r.fechaSueno.getUTCDay() + 6) % 7;
      horas[idx] = r.horasDormidas;
      calidades[idx] = r.calidadSueno;
    }

    return { dias, horas, calidades };
  }

  async findOne(userId: string, id: number) {
    const sueno = await this.prisma.sueno.findUnique({ where: { id } });
    if (!sueno) throw new NotFoundException('Registro de sueño no encontrado');
    if (sueno.idUsuario !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a este registro');
    }
    return sueno;
  }

  async update(userId: string, id: number, data: any) {
    const actual = await this.findOne(userId, id);

    const { horasDormidas, calidadSueno, fechaSueno } = data;

    if (
      horasDormidas === undefined &&
      calidadSueno === undefined &&
      fechaSueno === undefined
    ) {
      throw new BadRequestException('Debes enviar al menos un campo para actualizar');
    }

    const updateData: any = {};

    if (horasDormidas !== undefined) {
      updateData.horasDormidas = this.validarHorasDormidas(
        typeof horasDormidas === 'string' ? parseFloat(horasDormidas) : horasDormidas,
      );
    }
    if (calidadSueno !== undefined) {
      const horasRef =
        updateData.horasDormidas !== undefined
          ? updateData.horasDormidas
          : actual.horasDormidas;
      updateData.calidadSueno = this.normalizarCalidad(calidadSueno, horasRef);
    }
    if (fechaSueno !== undefined) {
      updateData.fechaSueno = this.parseFecha(fechaSueno);
    }

    const sueno = await this.prisma.sueno.update({
      where: { id },
      data: updateData,
    });

    return {
      mensaje: 'Registro de sueño actualizado con éxito',
      sueno,
    };
  }

  async remove(userId: string, id: number) {
    await this.findOne(userId, id);
    await this.prisma.sueno.delete({ where: { id } });
    return { mensaje: 'Registro de sueño eliminado' };
  }
}
