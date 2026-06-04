import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'mi_clave_secreta_super_segura',
    });
  }

  async validate(payload: any) {
    // El payload es el objeto decodificado que firmamos en el login
    return { userId: payload.sub, correo: payload.correo, nombre: payload.nombre };
  }
}
