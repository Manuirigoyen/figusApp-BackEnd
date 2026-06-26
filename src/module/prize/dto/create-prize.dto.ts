import { IsInt, IsPositive, Min } from 'class-validator';

/**
 * DTO para crear un nuevo Prize.
 * Define la estructura y validaciones obligatorias para POST /prizes.
 */
export class CreatePrizeDto {
  /**
   * ID del sticker incluido en el premio.
   * @example 9
   */
  @IsInt()
  @IsPositive()
  id_sticker!: number;

  /**
   * ID del pack bronce incluido en el premio.
   * @example 1
   */
  @IsInt()
  @IsPositive()
  id_packs_bronce!: number;

  /**
   * ID del pack plateado incluido en el premio.
   * @example 4
   */
  @IsInt()
  @IsPositive()
  id_packs_plateado!: number;

  /**
   * ID del pack dorado incluido en el premio.
   * @example 7
   */
  @IsInt()
  @IsPositive()
  id_packs_dorado!: number;

  /**
   * Cantidad de giros (spins) otorgados en el premio.
   * Puede ser 0 o más, según la combinación.
   * @example 5
   */
  @IsInt()
  @Min(0)
  spins!: number;
}