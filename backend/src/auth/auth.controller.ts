import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

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
}
