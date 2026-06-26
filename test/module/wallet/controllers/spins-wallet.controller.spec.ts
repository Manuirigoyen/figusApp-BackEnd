import { Test, TestingModule } from '@nestjs/testing';
import { SpinsWalletController } from '../../../../src/module/wallet/controllers/spins-wallet.controller';
import { SpinsWalletService } from '../../../../src/module/wallet/services/spins-wallet.service';
import { CreateSpinsWalletDto } from '../../../../src/module/wallet/dto/create-spins-wallet.dto';
import { UpdateSpinsWalletDto } from '../../../../src/module/wallet/dto/update-spins-wallet.dto';
import { SpinsWallet } from '../../../../src/module/wallet/entities/spins-wallet.entity';

describe('SpinsWalletController', () => {
  let controller: SpinsWalletController;
  let service: SpinsWalletService;

  const mockWallet = {
    id: 1,
    user_id: 1,
    stock: 100,
    user: {} as any,
  } as SpinsWallet;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpinsWalletController],
      providers: [
        {
          provide: SpinsWalletService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SpinsWalletController>(SpinsWalletController);
    service = module.get<SpinsWalletService>(SpinsWalletService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreateSpinsWalletDto = { user_id: 1, stock: 100 };
      mockService.create.mockResolvedValue(mockWallet);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockWallet);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      mockService.findAll.mockResolvedValue([mockWallet]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockWallet]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      mockService.findOne.mockResolvedValue(mockWallet);
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockWallet);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto: UpdateSpinsWalletDto = { stock: 200 };
      const updated = {...mockWallet, stock: 200 };
      mockService.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockService.remove.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});