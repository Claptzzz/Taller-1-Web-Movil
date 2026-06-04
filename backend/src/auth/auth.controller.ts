import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    // Aceptamos "contraseña" desde el front y lo pasamos al servicio
    return this.authService.register(body.nombre, body.correo, body.contraseña);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.correo, body.contraseña);
  }

  // Endpoint de prueba para validar que el Guard funciona
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user viene del JwtStrategy.validate()
    return req.user;
  }
}
