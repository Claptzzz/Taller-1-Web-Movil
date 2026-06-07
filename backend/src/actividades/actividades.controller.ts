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
import { ActividadesService } from './actividades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    return this.actividadesService.create(userId, body);
  }

  @Get()
  async findAll(@Request() req: any, @Query('fecha') fecha?: string) {
    const userId = req.user.userId;
    return this.actividadesService.findAll(userId, fecha);
  }

  @Get('calendario')
  async getCalendario(@Request() req: any) {
    const userId = req.user.userId;
    return this.actividadesService.getCalendario(userId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.actividadesService.findOne(userId, this.parseId(id));
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId;
    return this.actividadesService.update(userId, this.parseId(id), body);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.actividadesService.remove(userId, this.parseId(id));
  }
}
