import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pack } from "./entities/pack.entity";
import { PacksController } from "./packs.controller";
import { PacksService } from "./packs.service";
import { UploadsModule } from '../uploads/uploads.module';

/**
 * Módulo Packs con providers, controllers y TypeORM.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Pack]), UploadsModule],
  controllers: [PacksController],
  providers: [PacksService],
  exports: [PacksService],
})
export class PacksModule {}