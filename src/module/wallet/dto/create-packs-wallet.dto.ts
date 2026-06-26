import { IsNumber, Min } from "class-validator";

/**
 * DTO para la creación de un registro en la billetera de paquetes.
 * * Define los requisitos mínimos para asociar un paquete a un usuario
 * y establecer su cantidad inicial.
 */
export class CreatePacksWalletDto {
  /**
   * Identificador único del usuario al que se asigna el paquete.
   */
  @IsNumber()
  @Min(1)
  user_id!: number;

  /**
   * Identificador único del tipo de paquete.
   */
  @IsNumber()
  @Min(1)
  pack_id!: number;

  /**
   * Cantidad inicial de paquetes a asignar.
   */
  @IsNumber()
  @Min(0)
  stock!: number;
}
