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
import { User } from "../../users/entities/user.entity";

/**
 * Entidad Winner.
 * Registra a los usuarios que han completado un álbum y han ganado un premio.
 * Utiliza un índice único compuesto para asegurar que un usuario solo pueda tener 
 * un registro de ganador por álbum.
 */
@Index("uq_winner_user_album", ["user_id", "album_id"], {
  unique: true,
})
@Entity({ name: "winners" })
export class Winner {
  /**
   * Identificador único del registro de ganador.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  user_id!: number;

  @Column({ type: "int" })
  album_id!: number;

  /**
   * Nombre o descripción del premio obtenido.
   */
  @Column({ type: "varchar", length: 255 })
  prize!: string;

  /**
   * Fecha en la que el usuario alcanzó el estado de ganador.
   */
  @CreateDateColumn()
  created_at!: Date;

  /**
   * Relación con el usuario ganador (Eliminación en cascada).
   */
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  /**
   * Relación con el álbum completado (Eliminación en cascada).
   */
  @ManyToOne(() => Album, { onDelete: "CASCADE" })
  @JoinColumn({ name: "album_id" })
  album!: Album;
}