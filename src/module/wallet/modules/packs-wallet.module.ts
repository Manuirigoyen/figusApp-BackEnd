import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PacksWallet } from "../entities/packs-wallet.entity";
import { PacksWalletController } from "./../controllers/packs-wallet.controller";
import { PacksWalletService } from "./../services/packs-wallet.service";

/**
 * Módulo de Billetera de Paquetes (PacksWalletModule).
 * * Encapsula la gestión, persistencia y exposición de los endpoints REST 
 * relacionados con los paquetes (packs) almacenados en la billetera de los usuarios.
 */
@Module({
  imports: [
    /**
     * Registro de la entidad PacksWallet en TypeORM para habilitar el uso 
     * del repositorio en este módulo.
     */
    TypeOrmModule.forFeature([PacksWallet])
  ],
  controllers: [PacksWalletController],
  providers: [PacksWalletService],
  exports: [PacksWalletService],
})
export class PacksWalletModule {}
