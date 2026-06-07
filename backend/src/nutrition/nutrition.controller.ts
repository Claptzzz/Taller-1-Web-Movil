import { Controller, Post, Patch, Get, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Nutrition')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @ApiOperation({ summary: 'Actualizar hábitos diarios y consumo de agua (upsert por fecha)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fecha: { type: 'string', format: 'date', example: '2026-04-27' },
        aguaConsumida: { type: 'number', example: 1.5 },
        vegetales: { type: 'boolean', example: true },
        azucar: { type: 'boolean', example: false },
        proteina: { type: 'boolean', example: true },
        fruta: { type: 'boolean', example: true },
      },
      required: ['fecha'],
    },
  })
  @Patch('daily-habits')
  async updateDailyHabits(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    return this.nutritionService.updateDailyHabits(userId, body);
  }

  @ApiOperation({ summary: 'Registrar una nueva comida del día' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Ensalada de pollo' },
        categoria: {
          type: 'string',
          enum: ['desayuno', 'almuerzo', 'cena', 'snacks'],
          example: 'almuerzo',
        },
        fecha: { type: 'string', format: 'date', example: '2026-04-27' },
      },
      required: ['nombre', 'categoria', 'fecha'],
    },
  })
  @Post('meals')
  async addMeal(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    return this.nutritionService.addMeal(userId, body);
  }

  @ApiOperation({ summary: 'Eliminar una comida por id' })
  @ApiParam({ name: 'id', type: Number })
  @Delete('meals/:id')
  async deleteMeal(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.nutritionService.deleteMeal(userId, parseInt(id));
  }

  @ApiOperation({ summary: 'Dashboard del día: comidas agrupadas por categoría + hábitos/agua' })
  @ApiQuery({ name: 'fecha', required: true, example: '2026-04-27' })
  @Get('dashboard')
  async getDashboard(@Request() req: any, @Query('fecha') fecha: string) {
    const userId = req.user.userId;
    return this.nutritionService.getDashboard(userId, fecha);
  }
}
