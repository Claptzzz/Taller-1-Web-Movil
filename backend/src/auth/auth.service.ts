import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(nombre: string, correo: string, contrasena: string) {
    // Validar si el usuario ya existe
    const existe = await this.prisma.usuario.findUnique({ where: { correo } });
    if (existe) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Hashear la contraseña (10 rondas de sal)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    // Guardar en la base de datos
    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasena: hashedPassword,
      },
    });

    return {
      mensaje: 'Usuario registrado exitosamente',
      idUsuario: nuevoUsuario.id,
    };
  }

  async login(correo: string, contrasena: string) {
    // Buscar usuario por correo
    const usuario = await this.prisma.usuario.findUnique({ where: { correo } });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Comparar la contraseña enviada con el hash guardado
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Aquí normalmente generarías un JWT token real. Por ahora devolvemos la estructura acordada en BD.txt
    return {
      token: 'eyJhbGciOiJIUzI1NiIsIn... (Simulado por ahora)', 
      idUsuario: usuario.id,
      nombre: usuario.nombre,
    };
  }
}
