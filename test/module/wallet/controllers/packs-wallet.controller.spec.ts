import { Test, TestingModule } from '@nestjs/testing';
import { PacksWalletController } from '../../../../src/module/wallet/controllers/packs-wallet.controller';
import { PacksWalletService } from '../../../../src/module/wallet/services/packs-wallet.service';
import { CreatePacksWalletDto } from '../../../../src/module/wallet/dto/create-packs-wallet.dto';
import { UpdatePacksWalletDto } from '../../../../src/module/wallet/dto/update-packs-wallet.dto';
import { PacksWallet } from '../../../../src/module/wallet/entities/packs-wallet.entity';

describe('PacksWalletController', () => {
  let controller: PacksWalletController;
  let service: PacksWalletService;

  const mockWallet = {
    id: 1,
    user_id: 1,
    pack_id: 5,
    stock: 10,
    user: {} as any,
    pack: {} as any,
  } as PacksWallet;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacksWalletController],
      providers: [
        {
          provide: PacksWalletService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PacksWalletController>(PacksWalletController);
    service = module.get<PacksWalletService>(PacksWalletService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreatePacksWalletDto = { user_id: 1, pack_id: 5, stock: 10 };
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
      const dto: UpdatePacksWalletDto = { stock: 20 };
      const updated = {...mockWallet, stock: 20 };
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