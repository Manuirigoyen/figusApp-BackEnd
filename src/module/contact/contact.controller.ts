import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { ContactService } from './contact.service';

import { CreateContactDto } from './dto/create-contact.dto';

import { Public } from '../auth/decorators/public.decorator';

/**
 * Endpoints del formulario de contacto.
 */
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
  ) {}

  /**
   * Envía consulta del usuario.
   */
  @Public()
  @Post()
  async create(
    @Body()
    dto: CreateContactDto,
  ) {
    return this.contactService.sendContactMail(
      dto,
    );
  }
}
