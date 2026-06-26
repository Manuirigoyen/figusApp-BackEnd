import { IsNumber, Min } from "class-validator";

/**
 * DTO para la creación de un registro en la billetera de stickers (StickersWallet).
 * * Define los esquemas de validación para asegurar que la relación entre 
 * usuario y figurita, así como el stock inicial, sean válidos.
 */
export class CreateStickersWalletDto {
  /**
   * Identificador único del usuario dueño del registro.
   */
  @IsNumber()
  @Min(1)
  user_id!: number;

  /**
   * Identificador único de la figurita (sticker) a registrar en la billetera.
   */
  @IsNumber()
  @Min(1)
  sticker_id!: number;

  /**
   * Cantidad inicial de figuritas a asignar.
   */
  @IsNumber()
  @Min(0)
  stock!: number;
}