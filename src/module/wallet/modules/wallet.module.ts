import { Module } from "@nestjs/common";
import { PacksWalletModule } from "./packs-wallet.module";
import { SpinsWalletModule } from "./spins-wallet.module";
import { StickersWalletModule } from "./stickers-wallet.module";

@Module({
  imports: [PacksWalletModule, SpinsWalletModule, StickersWalletModule],
  exports: [PacksWalletModule, SpinsWalletModule, StickersWalletModule],
})
export class WalletModule {}
