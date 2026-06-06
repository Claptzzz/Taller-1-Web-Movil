import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}

  async updateDailyHabits(userId: string, data: any) {
    const { fecha, aguaConsumida, vegetales, azucar, proteina, fruta } = data;
    
    if (!fecha) throw new BadRequestException('Fecha es requerida');
    if (aguaConsumida !== undefined && aguaConsumida < 0) {
      throw new BadRequestException('El agua consumida no puede ser negativa');
    }

    const dateObj = new Date(fecha);
    dateObj.setUTCHours(0,0,0,0);

    // Obtener la ultima metrica para calcular el agua recomendada
    const ultimaMetrica = await this.prisma.metrica.findFirst({
      where: { idUsuario: userId },
      orderBy: { fecha_metrica: 'desc' }
    });

    // Calculo de agua recomendada basado en peso (35ml por kg)
    let aguaRecomendada = 2.5; // default 2.5L
    if (ultimaMetrica && ultimaMetrica.peso) {
      aguaRecomendada = parseFloat((ultimaMetrica.peso * 0.035).toFixed(1));
    }

    const upsertData = await this.prisma.habitosyAgua.upsert({
      where: {
        idUsuario_fecha: {
          idUsuario: userId,
          fecha: dateObj,
        }
      },
      update: {
        aguaConsumida: aguaConsumida !== undefined ? aguaConsumida : undefined,
        vegetales: vegetales !== undefined ? vegetales : undefined,
        azucar: azucar !== undefined ? azucar : undefined,
        proteina: proteina !== undefined ? proteina : undefined,
        fruta: fruta !== undefined ? fruta : undefined,
        aguaRecomendada, 
      },
      create: {
        idUsuario: userId,
        fecha: dateObj,
        aguaConsumida: aguaConsumida || 0,
        aguaRecomendada,
        vegetales: vegetales || false,
        azucar: azucar || false,
        proteina: proteina || false,
        fruta: fruta || false,
      }
    });

    return {
      mensaje: 'Hábitos diarios actualizados correctamente',
      datosActualizados: {
        aguaConsumida: upsertData.aguaConsumida,
        aguaRecomendada: upsertData.aguaRecomendada,
        vegetales: upsertData.vegetales,
        azucar: upsertData.azucar,
        proteina: upsertData.proteina,
        fruta: upsertData.fruta
      }
    };
  }

  async getDashboard(userId: string, fecha: string) {
    if (!fecha) throw new BadRequestException('Fecha es requerida');
    const dateObj = new Date(fecha);
    dateObj.setUTCHours(0,0,0,0);

    let habitos = await this.prisma.habitosyAgua.findUnique({
      where: {
        idUsuario_fecha: { idUsuario: userId, fecha: dateObj }
      }
    });

    // Siempre recalcular el agua recomendada al hacer GET para reflejar cambios inmediatos en el peso
    const ultimaMetrica = await this.prisma.metrica.findFirst({
      where: { idUsuario: userId },
      orderBy: { fecha_metrica: 'desc' }
    });

    let aguaRecomendada = 2.5;
    if (ultimaMetrica && ultimaMetrica.peso) {
      aguaRecomendada = parseFloat((ultimaMetrica.peso * 0.035).toFixed(1));
    }

    if (habitos && habitos.aguaRecomendada !== aguaRecomendada) {
      habitos = await this.prisma.habitosyAgua.update({
        where: { idUsuario_fecha: { idUsuario: userId, fecha: dateObj } },
        data: { aguaRecomendada }
      });
    }

    // Traemos de momento solo habitos, despues implementaremos las comidas
    return {
      habitosYAgua: habitos || null
    };
  }
}
