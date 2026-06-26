import { Test, TestingModule } from '@nestjs/testing';

import { ContactService } from '../../../src/module/contact/contact.service';

import { TurnstileService } from '../../../src/module/turnstile/turnstile.service';

describe('ContactService', () => {
  let service: ContactService;

  const mockTurnstileService = {
    validate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          ContactService,

          {
            provide: TurnstileService,
            useValue:
              mockTurnstileService,
          },
        ],
      }).compile();

    service =
      module.get<ContactService>(
        ContactService,
      );

    jest.clearAllMocks();
  });

  describe('sendContactMail', () => {
    it(
      'should validate captcha and return success message',
      async () => {
        mockTurnstileService.validate.mockResolvedValue(
          true,
        );

        const dto = {
          contact_reason: 'soporte',
          contact_email:
            'test@test.com',
          contact_message:
            'Mensaje de prueba',
          captcha_token: 'token',
        };

        const result =
          await service.sendContactMail(
            dto,
          );

        expect(
          mockTurnstileService.validate,
        ).toHaveBeenCalledWith(
          dto.captcha_token,
        );

        expect(result).toEqual({
          message:
            'Consulta enviada correctamente.',
        });
      },
    );
  });
});