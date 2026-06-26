import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

/**
 * DTO para la creación de un nuevo álbum.
 * Define las reglas de validación para los datos recibidos al crear un álbum.
 */
export class CreateAlbumDto {
  /**
   * Nombre del álbum.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  /**
   * Categoría del álbum.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category!: string;

  /**
   * Nacionalidad del álbum.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nationality!: string;

  /**
   * Descripción del álbum (opcional).
   */
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  /**
   * Capacidad de figuritas del álbum.
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  /**
   * URL de imagen de portada (opcional).
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover_image?: string;
}