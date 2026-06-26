import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Store } from '../../store/entities/store.entity';

/**
 * Entidad Purchase representa una compra en el sistema.
 * Relaciona usuario, tienda, cantidad y montos.
 */
@Entity({ name: 'purchases' })
export class Purchase {
  /**
   * ID único de la compra (auto-incremental).
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * ID del usuario comprador (FK).
   */
  @Column()
  user_id!: number;

  /**
   * ID de la tienda (FK).
   */
  @Column()
  store_id!: number;

  /**
   * Cantidad de items comprados.
   */
  @Column()
  quantity!: number;

  /**
   * Total bruto en USD.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_usd!: number;

  /**
   * Descuento aplicado en USD (default 0).
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_usd!: number;

  /**
   * Fecha/hora de la compra (auto-generada).
   */
  @CreateDateColumn()
  purchased_at!: Date;

  /**
   * Relación con usuario comprador.
   */
  @ManyToOne(() => User, (user) => user.purchases)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * Relación con tienda de la compra.
   */
  @ManyToOne(() => Store, (store) => store.purchases)
  @JoinColumn({ name: 'store_id' })
  store!: Store;
}