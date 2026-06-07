import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MetricsModule } from './metrics/metrics.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { ActividadesModule } from './actividades/actividades.module';

@Module({
  imports: [PrismaModule, AuthModule, MetricsModule, NutritionModule, ActividadesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
