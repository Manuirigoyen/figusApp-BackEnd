import { Test, TestingModule } from '@nestjs/testing';
import { StickersWalletService } from '../../../../src/module/wallet/services/stickers-wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StickersWallet } from '../../../../src/module/wallet/entities/stickers-wallet.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('StickersWalletService', () => {
  let service: StickersWalletService;
  let repo: Repository<StickersWallet>;

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

  const updatedWallet = {
    ...mockWallet,
    stock: 15,
  } as StickersWallet;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StickersWalletService,
        {
          provide: getRepositoryToken(StickersWallet),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<StickersWalletService>(StickersWalletService);
    repo = module.get<Repository<StickersWallet>>(getRepositoryToken(StickersWallet));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a wallet', async () => {
      const dto = { user_id: 1, sticker_id: 10, stock: 5 };
      mockRepo.create.mockReturnValue(mockWallet);
      mockRepo.save.mockResolvedValue(mockWallet);

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalledWith(mockWallet);
      expect(result).toEqual(mockWallet);
    });
  });

  describe('findAll', () => {
    it('should return all wallets with sticker relation', async () => {
      mockRepo.find.mockResolvedValue([mockWallet]);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({ relations: { sticker: true } });
      expect(result).toEqual([mockWallet]);
    });
  });

  describe('findOne', () => {
    it('should return a wallet if found', async () => {
      mockRepo.findOne.mockResolvedValue(mockWallet);

      const result = await service.findOne(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { sticker: true },
      });
      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'StickersWallet with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update and return wallet', async () => {
      const dto = { stock: 15 };

      mockRepo.findOne
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce(updatedWallet);
      mockRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, dto);

      expect(mockRepo.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepo.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedWallet);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { stock: 15 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove wallet', async () => {
      mockRepo.findOne.mockResolvedValue(mockWallet);
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { sticker: true },
      });
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});