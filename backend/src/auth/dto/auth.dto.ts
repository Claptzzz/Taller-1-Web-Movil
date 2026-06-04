export class RegisterDto {
  nombre: string;
  correo: string;
  contrasena: string; // The frontend might send "contraseña" but DTOs typically map it nicely, or we map it in the controller.
}

export class LoginDto {
  correo: string;
  contrasena: string;
}
