import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StoreService } from "./store.service";
import { StoreController } from "./store.controller";
import { Store } from "./entities/store.entity";
import { StoreComboItem } from "./entities/store-combo-item.entity";
import { WalletModule } from "../wallet/modules/wallet.module";

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreComboItem]), WalletModule],
  providers: [StoreService],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
