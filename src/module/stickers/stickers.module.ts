import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sticker } from "./entities/sticker.entity";
import { StickersController } from "./stickers.controller";
import { StickersService } from "./stickers.service";
import { UploadsModule } from '../uploads/uploads.module';

/**
 * Módulo Stickers con providers, controllers y TypeORM.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Sticker]), UploadsModule],
  controllers: [StickersController],
  providers: [StickersService],
  exports: [StickersService],
})
export class StickersModule {}