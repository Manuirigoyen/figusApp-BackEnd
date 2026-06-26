import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Album } from "../../albums/entities/album.entity";
import { StickersWallet } from "../../wallet/entities/stickers-wallet.entity";

/**
 * Entidad Sticker representa un sticker individual.
 * Relacionada con Album y StickersWallet.
 */
@Entity({ name: "stickers" })
export class Sticker {
  /**
   * ID único del sticker (auto-incremental).
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * ID del álbum al que pertenece (FK).
   */
  @Index("idx_stickers_album_id")
  @Column({ type: "int" })
  album_id!: number;

  /**
   * Clase o categoría del sticker.
   */
  @Column({ type: "varchar", length: 50 })
  class!: string;

  /**
   * Nombre del sticker.
   */
  @Index("idx_stickers_name")
  @Column({ type: "varchar", length: 255 })
  name!: string;

  /**
   * Nacionalidad del sticker.
   */
  @Column({ type: "varchar", length: 50 })
  nationality!: string;

  /**
   * URL de imagen de portada (opcional).
   */
  @Column({ type: "varchar", length: 500, nullable: true })
  cover_image!: string | null;

  /**
   * Relación con el álbum al que pertenece.
   */
  @ManyToOne(() => Album, (album) => album.stickers, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "album_id" })
  album!: Album;

  /**
   * Wallets de stickers que contienen este sticker.
   */
  @OneToMany(
    () => StickersWallet,
    (stickersWallet) => stickersWallet.sticker
  )
  stickersWallets!: StickersWallet[];
}