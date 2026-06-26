import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

@Injectable()
export class TurnstileService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  /**
   * Valida el token de Cloudflare Turnstile.
   * Lanza excepción si el token es inválido o si no se puede verificar.
   *
   * @param token Token generado por Turnstile en el frontend
   */
  async validate(
    token: string,
  ): Promise<void> {
    if (!token?.trim()) {
      throw new BadRequestException(
        'Captcha requerido',
      );
    }

    const secret =
      this.configService.get<string>(
        'TURNSTILE_SECRET_KEY',
      );

    if (!secret) {
      throw new InternalServerErrorException(
        'TURNSTILE_SECRET_KEY is not configured',
      );
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret,
          response: token,
        }),
      },
    );

    if (!response.ok) {
      throw new BadGatewayException(
        'No fue posible validar el captcha',
      );
    }

    const data =
      (await response.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      throw new BadRequestException(
        'Captcha inválido',
      );
    }
  }
}