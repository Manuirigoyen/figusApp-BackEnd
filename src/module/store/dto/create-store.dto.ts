import {
  IsEnum,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';
import { ProductType } from '../entities/store.entity';

/**
 * DTO para crear un nuevo producto en Store.
 * Define la estructura y validaciones reales para POST /store.
 */
export class CreateStoreDto {
  /**
   * ID del pack asociado de la tabla packs (opcional).
   * Requerido si el tipo de producto es 'pack'.
   * @example 1
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  pack_id?: number;

  /**
   * Nombre del producto en la tienda.
   * @example "Sobre de Oro - Qatar 2022"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * Descripción detallada del producto.
   * @example "Contiene 5 figuritas aleatorias con chance de Leyendas."
   */
  @IsString()
  @IsNotEmpty()
  description!: string;

  /**
   * Precio base del producto en USD.
   * @example 4.99
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  price_usd!: number;

  /**
   * Descuento fijo en USD (opcional).
   * @example 1.00
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount_usd?: number;

  /**
   * Descuento activo/promocional en USD (opcional).
   * @example 0.50
   */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  discount_active?: number;

  /**
   * Stock disponible del producto en la tienda.
   * @example 250
   */
  @IsInt()
  @Min(0)
  @IsOptional()
  stock_available?: number;

  /**
   * URL o path de la imagen de portada del producto.
   * @example "uploads/store/covers/gold_pack.png"
   */
  @IsString()
  @IsNotEmpty()
  cover_image!: string;

  /**
   * Tipo de producto en la tienda (pack, combo, unidad, spin).
   * @example "pack"
   */
  @IsEnum(ProductType)
  @IsNotEmpty()
  product_type!: ProductType;
}