import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';

/**
 * Módulo de uploads y manejo de almacenamiento local.
 */
@Module({
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}