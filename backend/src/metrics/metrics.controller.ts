import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Metrics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @ApiOperation({ summary: 'Registrar una nueva métrica corporal del usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        peso: { type: 'number', example: 72.5 },
        altura: { type: 'number', example: 1.75 },
        cintura: { type: 'number', example: 82 },
        grasa: { type: 'number', example: 18.4 },
      },
      required: ['peso', 'altura', 'cintura'],
    },
  })
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

  @ApiOperation({ summary: 'Obtener la última métrica registrada del usuario' })
  @Get()
  async getLatest(@Request() req: any) {
    return this.metricsService.getLatestMetric(req.user.userId);
  }
}
