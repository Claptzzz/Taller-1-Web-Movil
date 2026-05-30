import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    // Usamos el id del token por seguridad, aunque el frontend mande idUsuario
    const userId = req.user.userId;
    return this.metricsService.createMetric(
      userId,
      parseFloat(body.peso),
      parseFloat(body.altura),
      parseFloat(body.cintura),
      body.grasa ? parseFloat(body.grasa) : undefined,
    );
  }

  @Get()
  async getLatest(@Request() req: any) {
    return this.metricsService.getLatestMetric(req.user.userId);
  }
}
