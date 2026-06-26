import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Album } from "./album.entity";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { User } from "../../users/entities/user.entity";

/**
 * Entidad UserAlbumSticker.
 * Representa la relación muchos a muchos (a través de una tabla intermedia)
 * que registra qué figuritas (stickers) posee un usuario específico en un álbum concreto.
 */
@Index("uq_user_album_sticker", ["user_id", "album_id", "sticker_id"], {
  unique: true,
})
@Entity({ name: "user_album_stickers" })
export class UserAlbumSticker {
  /**
   * Identificador único del registro.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  user_id!: number;

  @Column({ type: "int" })
  album_id!: number;

  @Column({ type: "int" })
  sticker_id!: number;

  /**
   * Fecha de creación del registro.
   */
  @CreateDateColumn()
  created_at!: Date;

  /**
   * Relación con el usuario propietario (Eliminación en cascada).
   */
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  /**
   * Relación con el álbum al que pertenece la figurita (Eliminación en cascada).
   */
  @ManyToOne(() => Album, { onDelete: "CASCADE" })
  @JoinColumn({ name: "album_id" })
  album!: Album;

  /**
   * Relación con la figurita específica (Restringir eliminación si existe en un álbum).
   */
  @ManyToOne(() => Sticker, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "sticker_id" })
  sticker!: Sticker;
}