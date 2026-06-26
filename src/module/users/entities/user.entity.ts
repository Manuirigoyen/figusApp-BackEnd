import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

import { Offer } from '../../offers/entities/offer.entity';
import { Exchange } from '../../exchanges/entities/exchanges.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { SpinsWallet } from '../../wallet/entities/spins-wallet.entity';
import { StickersWallet } from '../../wallet/entities/stickers-wallet.entity';
import { PacksWallet } from '../../wallet/entities/packs-wallet.entity';

/**
 * Entidad User representa usuarios del sistema.
 * Incluye relaciones con ofertas, exchanges, compras y wallets.
 */
@Entity({ name: 'users' })
export class User {
  /**
   * ID único del usuario (auto-incremental).
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Nombre del usuario.
   */
  @Column({ type: 'varchar', length: 100 })
  first_name!: string;

  /**
   * Apellido del usuario.
   */
  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  /**
   * Fecha de nacimiento.
   */
  @Column({ type: 'date' })
  date_of_birth!: Date;

  /**
   * Nacionalidad del usuario.
   */
  @Column({ type: 'varchar', length: 50 })
  nationality!: string;

  /**
   * URL de foto de perfil.
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_picture?: string;

  /**
   * Email único del usuario.
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  /**
   * Número de teléfono.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number?: string;

  /**
   * Contraseña hasheada.
   */
  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password!: string;

  /**
   * Rol del usuario (user|admin)
   */
  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
    default: 'user',
  })
  role!: 'user' | 'admin';

  /**
   * Ofertas creadas por el usuario.
   */
  @OneToMany(() => Offer, (offer) => offer.user)
  offers!: Offer[];

  /**
   * Exchanges realizados por el usuario.
   */
  @OneToMany(() => Exchange, (exchange) => exchange.user)
  exchanges!: Exchange[];

  /**
   * Compras realizadas por el usuario.
   */
  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases!: Purchase[];

  /**
   * Wallet de spins del usuario.
   */
  @OneToMany(() => SpinsWallet, (wallet) => wallet.user)
  spinsWallets!: SpinsWallet[];

  /**
   * Wallet de stickers del usuario.
   */
  @OneToMany(() => StickersWallet, (wallet) => wallet.user)
  stickersWallets!: StickersWallet[];

  /**
   * Wallet de packs del usuario.
   */
  @OneToMany(() => PacksWallet, (wallet) => wallet.user)
  packsWallets!: PacksWallet[];
}