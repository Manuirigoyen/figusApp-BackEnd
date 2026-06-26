import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO para crear un nuevo paquete.
 */
export class CreatePackDto {
  /**
   * ID del álbum al que pertenece.
   */
  @IsNumber()
  @Min(1)
  album_id!: number;

  /**
   * Clase o categoría del paquete.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  class!: string;

  /**
   * Precio del paquete.
   */
  @IsNumber()
  @Min(0, { message: 'Price must be at least 0' })
  price!: number;

  /**
   * Stock disponible del paquete.
   */
  @IsNumber()
  @Min(0)
  stock!: number;

  /**
   * Capacidad de stickers en el paquete (opcional, por defecto 5).
   */
  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  /**
   * URL de imagen de portada (opcional).
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover_image?: string;
}