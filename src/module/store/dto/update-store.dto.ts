import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  Min,
} from 'class-validator';
import { ProductType } from '../entities/store.entity';

/**
 * DTO para actualizar un producto existente en Store.
 * Todos los campos son opcionales para permitir actualizaciones parciales (PATCH).
 */
export class UpdateStoreDto {
  /**
   * ID del pack asociado de la tabla packs (opcional).
   * @example 1
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  pack_id?: number;

  /**
   * Nombre del producto.
   * @example "Sobre Premium"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Descripción del producto.
   * @example "Sobre con figuritas premium"
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Precio base en USD.
   * @example 9.99
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  price_usd?: number;

  /**
   * Descuento fijo en USD.
   * @example 2.00
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount_usd?: number;

  /**
   * Descuento activo en USD.
   * @example 1.50
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount_active?: number;

  /**
   * Stock disponible.
   * @example 500
   */
  @IsInt()
  @Min(0)
  @IsOptional()
  stock_available?: number;

  /**
   * Imagen de portada.
   * @example "uploads/public/store/packs/sobrePremium.png"
   */
  @IsString()
  @IsOptional()
  cover_image?: string;

  /**
   * Tipo de producto.
   * @example "combo"
   */
  @IsEnum(ProductType)
  @IsOptional()
  product_type?: ProductType;
}