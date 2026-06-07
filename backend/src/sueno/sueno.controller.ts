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
import { SuenoService } from './sueno.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    return this.suenoService.create(userId, body);
  }

  @Get()
  async findAll(@Request() req: any, @Query('fecha') fecha?: string) {
    const userId = req.user.userId;
    return this.suenoService.findAll(userId, fecha);
  }

  @Get('semana')
  async getSemana(@Request() req: any) {
    const userId = req.user.userId;
    return this.suenoService.getSemana(userId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.suenoService.findOne(userId, this.parseId(id));
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.userId;
    return this.suenoService.update(userId, this.parseId(id), body);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.suenoService.remove(userId, this.parseId(id));
  }
}
