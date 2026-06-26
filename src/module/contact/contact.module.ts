import { Module } from '@nestjs/common';

import { TurnstileModule } from '../turnstile/turnstile.module';

import { ContactController } from './contact.controller';

import { ContactService } from './contact.service';

/**
 * Módulo del formulario de contacto.
 */
@Module({
  imports: [TurnstileModule],

  controllers: [ContactController],

  providers: [ContactService],
})
export class ContactModule {}