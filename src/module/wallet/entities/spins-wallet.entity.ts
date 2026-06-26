import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

/**
 * Entidad SpinsWallet.
 * * Gestiona el saldo actual de giros (spins) disponibles para cada usuario.
 */
@Entity({ name: "spins_wallet" })
export class SpinsWallet {
  /**
   * Identificador único de la billetera de giros.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * ID del usuario propietario de la billetera.
   * * Se recomienda indexar esta columna para agilizar las consultas de saldo.
   */
  @Index("idx_spins_wallet_user_id")
  @Column({ type: "int" })
  user_id!: number;

  /**
   * Cantidad de giros disponibles.
   */
  @Column({ type: "int", default: 0 })
  stock!: number;

  /**
   * Relación con la entidad User.
   * * La configuración onDelete: 'CASCADE' asegura que, al eliminar un usuario,
   * su registro de billetera de giros sea eliminado automáticamente.
   */
  @ManyToOne(() => User, (user) => user.spinsWallets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
