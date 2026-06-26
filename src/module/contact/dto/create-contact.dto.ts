import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

/**
 * DTO del formulario de contacto.
 */
export class CreateContactDto {
  @IsIn([
    'soporte',
    'compras',
    'sugerencias',
  ])
  contact_reason!: string;

  @IsEmail()
  contact_email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  contact_message!: string;

  @IsString()
  @IsNotEmpty()
  captcha_token!: string;
}