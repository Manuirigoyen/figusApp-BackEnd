import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrizeService } from './prize.service';
import { PrizeController } from './prize.controller';
import { Prize } from './entities/prize.entity';

/**
 * Módulo Prizes - gestiona toda la funcionalidad CRUD de premios.
 * Registra entidad, service y controller. Exporta service para reutilización.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Prize])],
  controllers: [PrizeController],
  providers: [PrizeService],
  exports: [PrizeService],
})
export class PrizesModule {}