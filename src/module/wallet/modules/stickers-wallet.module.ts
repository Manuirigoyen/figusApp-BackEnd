import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StickersWallet } from "../entities/stickers-wallet.entity";
import { StickersWalletController } from "./../controllers/stickers-wallet.controller";
import { StickersWalletService } from "./../services/stickers-wallet.service";

/**
 * Módulo de Billetera de Stickers (StickersWalletModule).
 * * Responsable de coordinar la lógica de negocio, el control de acceso y
 * la persistencia de datos relacionados con las figuritas (stickers)
 * que poseen los usuarios en sus billeteras personales.
 */
@Module({
  imports: [
    /**
     * Registro de la entidad StickersWallet.
     * * Permite que el repositorio de TypeORM esté disponible para inyección
     * dentro de los servicios de este módulo.
     */
    TypeOrmModule.forFeature([StickersWallet]),
  ],
  controllers: [StickersWalletController],
  providers: [StickersWalletService],
  exports: [StickersWalletService],
})
export class StickersWalletModule {}
