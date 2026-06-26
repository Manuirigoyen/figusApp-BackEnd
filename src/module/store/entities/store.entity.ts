import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { Pack } from '../../packs/entities/pack.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { StoreComboItem } from './store-combo-item.entity';

export enum ProductType {
  PACK = 'pack',
  COMBO = 'combo',
  UNIDAD = 'unidad',
  SPIN = 'spin',
}

@Entity({ name: 'store' })
export class Store {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  pack_id?: number | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_usd!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0.00' })
  discount_usd!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0.00' })
  discount_active!: string;

  @Column({ type: 'int', default: 0 })
  stock_available!: number;

  @Column({ type: 'varchar', length: 500 })
  cover_image!: string;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  product_type!: ProductType;

  @ManyToOne(() => Pack, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pack_id' })
  pack?: Pack | null;

  @OneToMany(() => Purchase, (purchase) => purchase.store)
  purchases!: Purchase[];

  @OneToMany(() => StoreComboItem, (comboItem) => comboItem.store)
  comboItems!: StoreComboItem[];
}
