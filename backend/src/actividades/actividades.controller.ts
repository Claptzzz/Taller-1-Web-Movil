import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ActividadesService } from './actividades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const ACTIVIDAD_BODY = {
  schema: {
    type: 'object' as const,
    properties: {
      descripcion: { type: 'string', example: 'Correr 5km' },
      hora: { type: 'string', example: '07:30' },
      fecha: { type: 'string', format: 'date', example: '2026-04-27' },
    },
  },
};

@ApiTags('Actividades')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  private parseId(id: string): number {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new BadRequestException('El id debe ser numérico');
    }
    return parsed;
  }

  @ApiOperation({ summary: 'Crear una nueva actividad' })
  @ApiBody(ACTIVIDAD_BODY)
  @Post()
  async create(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    return this.actividadesService.create(userId, body);
  }

  @ApiOperation({ summary: 'Listar actividades del usuario (opcionalmente filtradas por fecha)' })
  @ApiQuery({ name: 'fecha', required: false, example: '2026-04-27' })
  @Get()
  async findAll(@Request() req: any, @Query('fecha') fecha?: string) {
    const userId = req.user.userId;
    return this.actividadesService.findAll(userId, fecha);
  }

  @ApiOperation({ summary: 'Actividades agrupadas por fecha para vista de calendario' })
  @Get('calendario')
  async getCalendario(@Request() req: any) {
    const userId = req.user.userId;
    return this.actividadesService.getCalendario(userId);
  }

  @ApiOperation({ summary: 'Obtener una actividad por id' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.actividadesService.findOne(userId, this.parseId(id));
  }

  @ApiOperation({ summary: 'Editar parcialmente una actividad' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody(ACTIVIDAD_BODY)
  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId;
    return this.actividadesService.update(userId, this.parseId(id), body);
  }

  @ApiOperation({ summary: 'Eliminar una actividad' })
  @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.actividadesService.remove(userId, this.parseId(id));
  }
}
