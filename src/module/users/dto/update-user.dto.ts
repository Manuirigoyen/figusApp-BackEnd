import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * DTO para actualizar usuario existente.
 * Todos los campos son opcionales.
 */
export class UpdateUserDto {
  /**
   * Nuevo nombre.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string;

  /**
   * Nuevo apellido.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  /**
   * Nueva fecha de nacimiento.
   */
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  /**
   * Nueva nacionalidad.
   */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationality?: string;

  /**
   * Nueva URL de foto de perfil.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profile_picture?: string;

  /**
   * Nuevo email.
   */
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  /**
   * Nuevo teléfono.
   */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone_number?: string;

  /**
   * Nueva contraseña.
   * Debe contener al menos:
   * - 8 caracteres
   * - una mayúscula
   * - un número
   */
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe contener al menos una mayúscula y un número',
  })
  password?: string;
}
