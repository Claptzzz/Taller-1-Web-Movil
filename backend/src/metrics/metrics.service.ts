import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async createMetric(userId: string, peso: number, altura: number, cintura: number, grasa?: number) {
    if (!peso || peso <= 0 || !altura || altura <= 0 || !cintura || cintura <= 0) {
      throw new BadRequestException('Valores de peso, altura y cintura deben ser mayores a 0');
    }
    if (grasa !== undefined && grasa < 0) {
      throw new BadRequestException('Grasa no puede ser negativa');
    }

    const metrica = await this.prisma.metrica.create({
      data: {
        idUsuario: userId,
        peso,
        altura,
        cintura,
        grasa,
      },
    });

    // La fórmula real del RFM utiliza (altura / cintura)
    const rfm = 64 - (20 * (altura / cintura));
    let estadoSalud = 'normal';
    if (rfm < 15) estadoSalud = 'bajo peso';
    else if (rfm >= 25 && rfm < 35) estadoSalud = 'sobrepeso';
    else if (rfm >= 35) estadoSalud = 'obesidad';

    return {
      id: metrica.id,
      mensaje: 'Metrica guardada con exito',
      rfmCalculado: parseFloat(rfm.toFixed(1)),
      estadoSalud,
    };
  }

  async getLatestMetric(userId: string) {
    return this.prisma.metrica.findFirst({
      where: { idUsuario: userId },
      orderBy: { fecha_metrica: 'desc' },
    });
  }
}
