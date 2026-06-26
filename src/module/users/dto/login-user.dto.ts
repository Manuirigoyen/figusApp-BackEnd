import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO para login de usuario.
 * Usado en POST /auth/login.
 */
export class LoginUserDto {
  /**
   * Email del usuario.
   * @example "user@example.com"
   */
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(120)
  email!: string;

  /**
   * Contraseña del usuario.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  /**
   * Token del CAPTCHA Turnstile.
   */
  @IsString()
  @IsNotEmpty()
  captcha_token!: string;
}