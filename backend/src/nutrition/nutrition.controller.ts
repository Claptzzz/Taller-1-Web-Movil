import { Controller, Post, Patch, Get, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Patch('daily-habits')
  async updateDailyHabits(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    return this.nutritionService.updateDailyHabits(userId, body);
  }

  @Post('meals')
  async addMeal(@Request() req: any, @Body() body: any) {
    const userId = req.user.userId;
    return this.nutritionService.addMeal(userId, body);
  }

  @Delete('meals/:id')
  async deleteMeal(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.nutritionService.deleteMeal(userId, parseInt(id));
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any, @Query('fecha') fecha: string) {
    const userId = req.user.userId;
    return this.nutritionService.getDashboard(userId, fecha);
  }
}
