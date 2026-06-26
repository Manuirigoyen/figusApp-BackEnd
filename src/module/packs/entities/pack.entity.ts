import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Album } from "../../albums/entities/album.entity";
import { PacksWallet } from "../../wallet/entities/packs-wallet.entity";

@Check(`"price" >= 0`)
@Check(`"stock" >= 0`)
/**
 * Entidad Pack representa un conjunto de stickers que se compran.
 * Relacionada con Album y PacksWallet.
 */
@Entity({ name: "packs" })
export class Pack {
  /**
   * ID único del paquete (auto-incremental).
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * ID del álbum al que pertenece (FK).
   */
  @Index("idx_packs_album_id")
  @Column({ type: "int" })
  album_id!: number;

  /**
   * Clase o categoría del paquete.
   */
  @Column({ type: "varchar", length: 50 })
  class!: string;

  /**
   * Precio del paquete.
   */
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  /**
   * Stock disponible del paquete.
   */
  @Column({ type: "int", default: 0 })
  stock!: number;

  /**
   * Capacidad de stickers en el paquete.
   */
  @Column({ type: "int", default: 5 })
  capacity!: number;

  /**
   * URL de imagen de portada (opcional).
   */
  @Column({ type: "varchar", length: 500, nullable: true })
  cover_image!: string | null;

  /**
   * Relación con el álbum al que pertenece.
   */
  @ManyToOne(() => Album, (album) => album.packs, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "album_id" })
  album!: Album;

  /**
   * Wallets de paquetes que contienen este paquete.
   */
  @OneToMany(() => PacksWallet, (packsWallet) => packsWallet.pack)
  packsWallets!: PacksWallet[];
}
