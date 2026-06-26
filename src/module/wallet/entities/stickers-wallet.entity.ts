import { OneToMany, Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, Check } from "typeorm";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { Exchange } from "../../exchanges/entities/exchanges.entity"; 
import { Offer } from '../../offers/entities/offer.entity'; 
import { User } from "../../users/entities/user.entity";

/**
 * Entidad StickersWallet.
 * * Representa el inventario de figuritas (stickers) de un usuario.
 * * Mantiene la cantidad disponible (stock) y las relaciones con ofertas e intercambios.
 */
@Check(`"stock" >= 0`)
@Index("uq_stickers_wallet_user_sticker", ["user_id", "sticker_id"], { unique: true })
@Entity({ name: "stickers_wallet" })
export class StickersWallet {
  /**
   * Identificador único del registro en la billetera.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  @Index("idx_stickers_wallet_user_id")
  @Column({ type: "int" })
  user_id!: number;

  @Index("idx_stickers_wallet_sticker_id")
  @Column({ type: "int" })
  sticker_id!: number;

  /**
   * Cantidad disponible de esta figurita específica.
   */
  @Column({ type: "int", default: 0 })
  stock!: number;

  /**
   * Relación con la entidad Sticker.
   */
  @ManyToOne(() => Sticker, (sticker) => sticker.stickersWallets, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "sticker_id" })
  sticker!: Sticker;

  /**
   * Relación con el usuario propietario.
   */
  @ManyToOne(() => User, (user) => user.stickersWallets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "user_id" })
  user!: User;

  /**
   * Intercambios donde esta billetera actúa como parte oferente.
   */
  @OneToMany(() => Exchange, (exchange) => exchange.offeredWallet, {
    cascade: true,
  })
  offeredExchanges!: Exchange[];

  /**
   * Ofertas creadas utilizando ítems de esta billetera.
   */
  @OneToMany(() => Offer, (offer) => offer.offerWallet)
  offeredOffers!: Offer[];

  /**
   * Intercambios donde esta billetera actúa como parte receptora.
   */
  @OneToMany(() => Exchange, (exchange) => exchange.receivedWallet, {
    cascade: true,
  })
  receivedExchanges!: Exchange[];
}