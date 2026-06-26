import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  MinLength,
} from 'class-validator';

/**
 * DTO para la creación de un nuevo usuario.
 * * Define las reglas de validación para los datos enviados durante el registro
 * en el sistema, asegurando la integridad de los datos antes de su persistencia.
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @IsString()
  @IsNotEmpty()
  last_name!: string;

  /**
   * Fecha de nacimiento en formato ISO 8601.
   */
  @IsDateString()
  @IsNotEmpty()
  date_of_birth!: string;

  @IsString()
  @IsNotEmpty()
  nationality!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  /**
   * Contraseña del usuario (mínimo 8 caracteres).
   */
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  /**
   * Token generado por Cloudflare Turnstile para prevenir bots.
   */
  @IsString()
  @IsNotEmpty()
  captcha_token!: string;
}