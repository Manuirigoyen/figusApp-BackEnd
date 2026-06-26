import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Pack } from "../../packs/entities/pack.entity";
import { Sticker } from "../../stickers/entities/sticker.entity";

/**
 * Entidad Album que representa un conjunto de stickers.
 */
@Entity({ name: "albums" })
export class Album {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ name: "class", type: "varchar", length: 50 })
  class!: string;

  @Column({ type: "varchar", length: 50 })
  nationality!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 0 })
  capacity!: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  cover_image!: string | null;

  @OneToMany(() => Pack, (pack) => pack.album)
  packs!: Pack[];

  @OneToMany(() => Sticker, (sticker) => sticker.album)
  stickers!: Sticker[];
}
