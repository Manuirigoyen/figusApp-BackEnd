import { IsInt, IsOptional, IsPositive, Min, IsBoolean, IsNumber } from 'class-validator';

/**
 * DTO para actualizar un Prize existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales (PUT).
 */
export class UpdatePrizeDto {
  /**
   * ID del sticker (opcional).
   * @example 9
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  id_sticker?: number;

  /**
   * ID del pack bronce (opcional).
   * @example 1
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  id_packs_bronce?: number;

  /**
   * ID del pack plateado (opcional).
   * @example 4
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  id_packs_plateado?: number;

  /**
   * ID del pack dorado (opcional).
   * @example 7
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  id_packs_dorado?: number;

  /**
   * Cantidad de giros (spins) del premio (opcional).
   * @example 5
   */
  @IsInt()
  @Min(0)
  @IsOptional()
  spins?: number;

  /**
   * Estado vacío del premio en la ruleta (opcional).
   */
  @IsBoolean()
  @IsOptional()
  is_empty?: boolean;

  /**
   * Nueva probabilidad del premio (opcional).
   * @example 0.15
   */
  @IsNumber()
  @IsOptional()
  probabily?: number; // Mantenido igual por consistencia con tu base de datos actual
}