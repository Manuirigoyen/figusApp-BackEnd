import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Offer } from './offer.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'offer_rejections' })
@Index(['offer_id', 'user_id'], { unique: true })
export class OfferRejection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  offer_id!: number;

  @Column({ type: 'int' })
  user_id!: number;

  @CreateDateColumn({ type: 'timestamp' })
  date_created!: Date;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer!: Offer;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}