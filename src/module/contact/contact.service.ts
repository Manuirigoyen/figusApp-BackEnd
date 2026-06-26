import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { TurnstileService } from '../turnstile/turnstile.service';

import { CreateContactDto } from './dto/create-contact.dto';

/**
 * Servicio encargado del formulario de contacto.
 */
@Injectable()
export class ContactService {
  private readonly logger =
    new Logger(ContactService.name);

  constructor(
    private readonly turnstileService: TurnstileService,
  ) {}

  /**
   * Procesa formulario de contacto.
   *
   * Valida CAPTCHA y simula
   * recepción del mensaje.
   */
  async sendContactMail(
    dto: CreateContactDto,
  ) {
    await this.turnstileService.validate(
      dto.captcha_token,
    );

    /**
     * Simulación de recepción de mensajes.
     */
    this.logger.log(
      `
      Nueva consulta recibida:

      Email: ${dto.contact_email}

      Motivo: ${dto.contact_reason}

      Mensaje:
      ${dto.contact_message}
      `,
    );

    return {
      message:
        'Consulta enviada correctamente.',
    };
  }
}