import { Test, TestingModule } from '@nestjs/testing';
import { StickersWalletController } from '../../../../src/module/wallet/controllers/stickers-wallet.controller';
import { StickersWalletService } from '../../../../src/module/wallet/services/stickers-wallet.service';
import { CreateStickersWalletDto } from '../../../../src/module/wallet/dto/create-stickers-wallet.dto';
import { UpdateStickersWalletDto } from '../../../../src/module/wallet/dto/update-stickers-wallet.dto';
import { StickersWallet } from '../../../../src/module/wallet/entities/stickers-wallet.entity';

describe('StickersWalletController', () => {
  let controller: StickersWalletController;
  let service: StickersWalletService;

  const mockWallet = {
    id: 1,
    user_id: 1,
    sticker_id: 10,
    stock: 5,
    user: {} as any,
    sticker: {} as any,
    offeredExchanges: [],
    offeredOffers: [],
    receivedExchanges: [],
  } as StickersWallet;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StickersWalletController],
      providers: [
        {
          provide: StickersWalletService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<StickersWalletController>(StickersWalletController);
    service = module.get<StickersWalletService>(StickersWalletService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreateStickersWalletDto = { user_id: 1, sticker_id: 10, stock: 5 };
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
      const dto: UpdateStickersWalletDto = { stock: 15 };
      const updated = {...mockWallet, stock: 15 };
      mockService.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return deleted wallet', async () => {
      mockService.remove.mockResolvedValue(mockWallet);
      const result = await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockWallet);
    });
  });
});