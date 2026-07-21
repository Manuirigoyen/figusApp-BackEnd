import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StickersWallet } from "../entities/stickers-wallet.entity";
import { Offer } from "../../offers/entities/offer.entity";
import { Exchange } from "../../exchanges/entities/exchanges.entity";
import { StickersWalletController } from "./../controllers/stickers-wallet.controller";
import { StickersWalletService } from "./../services/stickers-wallet.service";
import { UploadsModule } from "../../uploads/uploads.module";

/**
 * Módulo de Billetera de Stickers (StickersWalletModule).
 * * Responsable de coordinar la lógica de negocio, el control de acceso y
 * la persistencia de datos relacionados con las figuritas (stickers)
 * que poseen los usuarios en sus billeteras personales.
 */
@Module({
  imports: [
    /**
     * Registro de las entidades StickersWallet, Offer y Exchange.
     * * Permite que los repositorios de TypeORM estén disponibles para inyección
     * dentro de los servicios de este módulo.
     */
    TypeOrmModule.forFeature([StickersWallet, Offer, Exchange]),
    UploadsModule,
  ],
  controllers: [StickersWalletController],
  providers: [StickersWalletService],
  exports: [StickersWalletService],
})
export class StickersWalletModule {}