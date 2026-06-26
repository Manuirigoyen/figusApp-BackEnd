import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';
import { Exchange } from './entities/exchanges.entity';

/**
 * Módulo Exchanges - gestiona toda la funcionalidad CRUD de exchanges.
 * Registra entidad, service y controller. Exporta service para reutilización.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Exchange])],
  controllers: [ExchangesController],
  providers: [ExchangesService],
  exports: [ExchangesService],
})
export class ExchangesModule {}