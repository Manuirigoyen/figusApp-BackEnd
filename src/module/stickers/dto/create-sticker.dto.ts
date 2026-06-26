import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

/**
 * DTO para crear un nuevo sticker.
 */
export class CreateStickerDto {
  /**
   * ID del álbum al que pertenece.
   */
  @IsNumber()
  @Min(1)
  album_id!: number;

  /**
   * Clase o categoría del sticker.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  class!: string;

  /**
   * Nombre del sticker.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  /**
   * Nacionalidad del sticker.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nationality!: string;

  /**
   * URL de imagen de portada (opcional).
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover_image?: string;
}