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
import { SuenoService } from './sueno.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const SUENO_BODY = {
  schema: {
    type: 'object' as const,
    properties: {
      horasDormidas: { type: 'number', example: 7.5 },
      calidadSueno: {
        type: 'string',
        enum: ['ALTA', 'MEDIA', 'BAJA'],
        example: 'MEDIA',
      },
      fechaSueno: { type: 'string', format: 'date', example: '2026-04-27' },
    },
  },
};

@ApiTags('Sueno')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('sueno')
export class SuenoController {
  constructor(private readonly suenoService: SuenoService) {}

  private parseId(id: string): number {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new BadRequestException('El id debe ser numérico');
    }
    return parsed;
  }

  @ApiOperation({
    summary:
      'Crear un registro de sueño (acepta horasDormidas directo o el par horaInicio/horaFin en formato HH:MM)',
  })
  @ApiBody(SUENO_BODY)
  @Post()
  async create(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    return this.suenoService.create(userId, body);
  }

  @ApiOperation({ summary: 'Listar registros de sueño (opcionalmente filtrados por fecha)' })
  @ApiQuery({ name: 'fecha', required: false, example: '2026-04-27' })
  @Get()
  async findAll(@Request() req: any, @Query('fecha') fecha?: string) {
    const userId = req.user.userId;
    return this.suenoService.findAll(userId, fecha);
  }

  @ApiOperation({ summary: 'Resumen de horas dormidas de la semana actual (lunes a domingo)' })
  @Get('semana')
  async getSemana(@Request() req: any) {
    const userId = req.user.userId;
    return this.suenoService.getSemana(userId);
  }

  @ApiOperation({ summary: 'Obtener un registro de sueño por id' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.suenoService.findOne(userId, this.parseId(id));
  }

  @ApiOperation({ summary: 'Editar parcialmente un registro de sueño' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody(SUENO_BODY)
  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId;
    return this.suenoService.update(userId, this.parseId(id), body);
  }

  @ApiOperation({ summary: 'Eliminar un registro de sueño' })
  @ApiParam({ name: 'id', type: Number })
  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.suenoService.remove(userId, this.parseId(id));
  }
}
