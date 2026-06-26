import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Pack } from "../../packs/entities/pack.entity";
import { User } from "../../users/entities/user.entity";

@Check(`"stock" >= 0`)
@Unique("uq_packs_wallet_user_pack", ["user_id", "pack_id"])
@Entity({ name: "packs_wallet" })
export class PacksWallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index("idx_packs_wallet_user_id")
  @Column({ type: "int" })
  user_id!: number;

  @Index("idx_packs_wallet_pack_id")
  @Column({ type: "int" })
  pack_id!: number;

  @Column({ type: "int", default: 0 })
  stock!: number;

  @ManyToOne(() => Pack, (pack) => pack.packsWallets, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "pack_id" })
  pack!: Pack;

  @ManyToOne(() => User, (user) => user.packsWallets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
