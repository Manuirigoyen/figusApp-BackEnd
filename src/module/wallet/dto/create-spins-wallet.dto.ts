import { IsNumber, Min } from "class-validator";

/**
 * DTO para la creación de un registro en la billetera de giros (SpinsWallet).
 * * Define los esquemas de validación necesarios para registrar un saldo inicial 
 * de giros para un usuario en el sistema.
 */
export class CreateSpinsWalletDto {
  /**
   * Identificador único del usuario al que se le asignarán los giros.
   * * Debe ser un número positivo (mínimo 1).
   */
  @IsNumber()
  @Min(1)
  user_id!: number;

  /**
   * Cantidad inicial de giros a asignar.
   * * Puede ser 0 o mayor.
   */
  @IsNumber()
  @Min(0)
  stock!: number;
}
