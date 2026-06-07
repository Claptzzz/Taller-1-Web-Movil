import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Juan Pérez' },
        correo: { type: 'string', example: 'juan@example.com' },
        contraseña: { type: 'string', example: 'secret123' },
      },
      required: ['nombre', 'correo', 'contraseña'],
    },
  })
  @Post('register')
  register(@Body() body: any) {
    // Aceptamos "contraseña" desde el front y lo pasamos al servicio
    return this.authService.register(body.nombre, body.correo, body.contraseña);
  }

  @ApiOperation({ summary: 'Iniciar sesión y obtener un token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correo: { type: 'string', example: 'juan@example.com' },
        contraseña: { type: 'string', example: 'secret123' },
      },
      required: ['correo', 'contraseña'],
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.correo, body.contraseña);
  }

  // Endpoint de prueba para validar que el Guard funciona
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user viene del JwtStrategy.validate()
    return req.user;
  }
}
