import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO para actualizar compra existente.
 */
export class UpdatePurchaseDto {
  /**
   * ID del usuario (opcional).
   */
  @IsInt()
  @IsOptional()
  user_id?: number;

  /**
   * ID de la tienda (opcional).
   */
  @IsInt()
  @IsOptional()
  store_id?: number;

  /**
   * Nueva cantidad (opcional).
   */
  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;

  /**
   * Nuevo total en USD (opcional).
   */
  @IsNumber()
  @IsOptional()
  total_usd?: number;

  /**
   * Nuevo descuento en USD (opcional).
   */
  @IsNumber()
  @IsOptional()
  discount_usd?: number;
}