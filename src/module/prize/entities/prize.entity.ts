import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Pack } from '../../packs/entities/pack.entity';

/**
 * Entidad Prize representa un premio combinado fijo del sistema (Ruleta).
 * Incluye un sticker, tres tipos de sobres y giros (spins). Ninguno es nulo.
 */
@Entity({ name: 'prize' })
export class Prize {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: false })
  id_sticker!: number;

  @Column({ type: 'int', nullable: false })
  id_packs_bronce!: number;

  @Column({ type: 'int', nullable: false })
  id_packs_plateado!: number;

  @Column({ type: 'int', nullable: false })
  id_packs_dorado!: number;

  /**
   * Cantidad de giros (spins) otorgados.
   */
  @Column({ type: 'int', nullable: false })
  spins!: number;

  /**
   * Relación con el Sticker/Figurita (que está mapeado en la tabla packs)
   */
  @ManyToOne(() => Pack, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sticker' })
  sticker!: Pack;

  /**
   * Relación con el Sobre Bronce
   */
  @ManyToOne(() => Pack, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_packs_bronce' })
  packBronce!: Pack;

  /**
   * Relación con el Sobre Plateado
   */
  @ManyToOne(() => Pack, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_packs_plateado' })
  packPlateado!: Pack;

  /**
   * Relación con el Sobre Dorado
   */
  @ManyToOne(() => Pack, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_packs_dorado' })
  packDorado!: Pack;
}