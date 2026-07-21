import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Exchange } from '../../exchanges/entities/exchanges.entity';
import { StickersWallet } from '../../wallet/entities/stickers-wallet.entity';
import { Sticker } from '../../stickers/entities/sticker.entity';

export enum OfferType {
  STICKER = 'sticker',
  PACK = 'pack',
  SPRINGS = 'springs',
}

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity({ name: 'offers' })
export class Offer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  offerer_user_id!: number;

  @Column({ nullable: true })
  offer_wallet_id!: number;

  /** Figurita ofrecida (independiente del wallet, para historial). */
  @Column({ nullable: true })
  offered_sticker_id!: number;

  /** Nombre denormalizado para preservar historial si se elimina el wallet. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  offered_sticker_name!: string;

  @Column()
  offered_quantity!: number;

  @Column({
    type: 'enum',
    enum: OfferType,
    default: OfferType.STICKER,
  })
  offered!: OfferType;

  @Column({ nullable: true })
  request_sticker_id!: number;

  /** Nombre denormalizado de la figurita solicitada. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  request_sticker_name!: string;

  @Column({
    type: 'enum',
    enum: OfferType,
    default: OfferType.STICKER,
  })
  request!: OfferType;

  @Column()
  request_quantity!: number;

  @CreateDateColumn()
  date_created!: Date;

  @Column({ type: 'timestamp' })
  date_expires!: Date;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.PENDING,
  })
  status!: OfferStatus;

  @ManyToOne(() => User, (user) => user.offers)
  @JoinColumn({ name: 'offerer_user_id' })
  user!: User;

  @ManyToOne(() => StickersWallet, (wallet) => wallet.offeredOffers, {
    nullable: true,
  })
  @JoinColumn({ name: 'offer_wallet_id' })
  offerWallet!: StickersWallet;

  @ManyToOne(() => Sticker, { nullable: true })
  @JoinColumn({ name: 'offered_sticker_id' })
  offeredSticker!: Sticker;

  @ManyToOne(() => Sticker, { nullable: true })
  @JoinColumn({ name: 'request_sticker_id' })
  requestSticker!: Sticker;

  @OneToMany(() => Exchange, (exchange) => exchange.offer)
  exchanges!: Exchange[];
}