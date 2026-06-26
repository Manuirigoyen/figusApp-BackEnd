import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './user.controller';

import { User } from './entities/user.entity';

import { UploadsModule } from '../uploads/uploads.module';
import { TurnstileModule } from '../turnstile/turnstile.module';

/**
 * Módulo Users con providers, controllers y TypeORM.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UploadsModule,
    TurnstileModule,
  ],

  providers: [UsersService],

  controllers: [UsersController],

  exports: [UsersService],
})
export class UsersModule {}