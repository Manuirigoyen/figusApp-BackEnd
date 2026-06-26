import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpinsWallet } from "../entities/spins-wallet.entity";
import { SpinsWalletController } from "./../controllers/spins-wallet.controller";
import { SpinsWalletService } from "./../services/spins-wallet.service";
import { PacksWalletModule } from "./packs-wallet.module";

@Module({
  imports: [TypeOrmModule.forFeature([SpinsWallet]), PacksWalletModule],
  controllers: [SpinsWalletController],
  providers: [SpinsWalletService],
  exports: [SpinsWalletService],
})
export class SpinsWalletModule {}
