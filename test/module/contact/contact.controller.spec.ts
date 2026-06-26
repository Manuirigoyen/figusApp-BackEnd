import { Test, TestingModule } from '@nestjs/testing';

import { ContactController } from '../../../src/module/contact/contact.controller';

import { ContactService } from '../../../src/module/contact/contact.service';

describe('ContactController', () => {
  let controller: ContactController;

  const mockContactService = {
    sendContactMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [ContactController],

        providers: [
          {
            provide: ContactService,
            useValue: mockContactService,
          },
        ],
      }).compile();

    controller =
      module.get<ContactController>(
        ContactController,
      );

    jest.clearAllMocks();
  });

  describe('create', () => {
    it(
      'should process contact form',
      async () => {
        mockContactService.sendContactMail.mockResolvedValue(
          {
            message:
              'Consulta enviada correctamente.',
          },
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
          await controller.create(
            dto,
          );

        expect(result).toEqual({
          message:
            'Consulta enviada correctamente.',
        });

        expect(
          mockContactService.sendContactMail,
        ).toHaveBeenCalledWith(dto);
      },
    );
  });
});