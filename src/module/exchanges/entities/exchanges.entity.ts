import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { StickersWallet } from '../../wallet/entities/stickers-wallet.entity';
import { Sticker } from '../../stickers/entities/sticker.entity';

export enum ExchangeStatus { 
  PENDING = 'pending',
  COMPLETED = 'completed', 
  CANCELLED = 'cancelled' 
}

/**
 * Entidad Exchange representa un intercambio entre wallets.
 * Relacionada con User, Offer y StickersWallet.
 */
@Entity({ name: 'exchanges' })
export class Exchange {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  offer_id!: number;

  @Column()
  accepter_user_id!: number;

  @Column()
  offered_quantity!: number;

  @Column()
  received_quantity!: number;

  @Column({ type: 'timestamp', nullable: true })
  date_completed?: Date;

  @Column({ type: 'enum', enum: ExchangeStatus, default: ExchangeStatus.COMPLETED })
  status!: ExchangeStatus;

  /** Figurita que se ofreció (snapshot permanente para historial). */
  @Column({ nullable: true })
  offered_sticker_id?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  offered_sticker_name?: string;

  /** Figurita que se recibió / entregó el aceptante (snapshot permanente). */
  @Column({ nullable: true })
  received_sticker_id?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  received_sticker_name?: string;

  @ManyToOne(() => User, (user) => user.exchanges)
  @JoinColumn({ name: 'accepter_user_id' })
  user!: User;

  @ManyToOne(() => Offer, (offer) => offer.exchanges)
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer;

  @ManyToOne(() => StickersWallet, (wallet) => wallet.offeredExchanges, { nullable: true })
  @JoinColumn({ name: 'offered_wallet_id' })
  offeredWallet?: StickersWallet;

  @ManyToOne(() => Sticker, { nullable: true })
  @JoinColumn({ name: 'offered_sticker_id' })
  offeredSticker?: Sticker;

  @ManyToOne(() => StickersWallet, (wallet) => wallet.receivedExchanges, { nullable: true })
  @JoinColumn({ name: 'received_wallet_id' })
  receivedWallet?: StickersWallet;

  @ManyToOne(() => Sticker, { nullable: true })
  @JoinColumn({ name: 'received_sticker_id' })
  receivedSticker?: Sticker;
}