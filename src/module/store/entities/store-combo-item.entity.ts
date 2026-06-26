import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Pack } from '../../packs/entities/pack.entity';

@Entity({ name: 'store_combo_items' })
export class StoreComboItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: false })
  store_id!: number;

  @Column({ type: 'int', nullable: true })
  pack_id?: number | null;

  @Column({ type: 'int', default: 0 })
  spin_quantity!: number;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @ManyToOne(() => Store, (store) => store.comboItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store!: Store;

  @ManyToOne(() => Pack, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pack_id' })
  pack?: Pack | null;
}
