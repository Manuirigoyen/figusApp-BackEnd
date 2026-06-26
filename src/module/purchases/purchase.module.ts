import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchase.controller';
import { Purchase } from './entities/purchase.entity';

/**
 * Módulo Purchases con providers, controllers y TypeORM.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Purchase])],
  providers: [PurchasesService],
  controllers: [PurchasesController],
  exports: [PurchasesService],
})
export class PurchasesModule {}