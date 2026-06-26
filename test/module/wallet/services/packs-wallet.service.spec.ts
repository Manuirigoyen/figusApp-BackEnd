import { Test, TestingModule } from '@nestjs/testing';
import { PacksWalletService } from '../../../../src/module/wallet/services/packs-wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PacksWallet } from '../../../../src/module/wallet/entities/packs-wallet.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PacksWalletService', () => {
  let service: PacksWalletService;
  let repo: Repository<PacksWallet>;

  const mockWallet = {
    id: 1,
    user_id: 1,
    pack_id: 5,
    stock: 10,
    user: {} as any,
    pack: {} as any,
  } as PacksWallet;

  const updatedWallet = {
    ...mockWallet,
    stock: 20,
  } as PacksWallet;

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
        PacksWalletService,
        {
          provide: getRepositoryToken(PacksWallet),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<PacksWalletService>(PacksWalletService);
    repo = module.get<Repository<PacksWallet>>(getRepositoryToken(PacksWallet));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a wallet', async () => {
      const dto = { user_id: 1, pack_id: 5, stock: 10 };
      mockRepo.create.mockReturnValue(mockWallet);
      mockRepo.save.mockResolvedValue(mockWallet);

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalledWith(mockWallet);
      expect(result).toEqual(mockWallet);
    });
  });

  describe('findAll', () => {
    it('should return all wallets with pack relation', async () => {
      mockRepo.find.mockResolvedValue([mockWallet]);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({ relations: { pack: true } });
      expect(result).toEqual([mockWallet]);
    });
  });

  describe('findOne', () => {
    it('should return a wallet if found', async () => {
      mockRepo.findOne.mockResolvedValue(mockWallet);

      const result = await service.findOne(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { pack: true },
      });
      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'PacksWallet with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update and return wallet', async () => {
      const dto = { stock: 20 };

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

      await expect(service.update(999, { stock: 20 })).rejects.toThrow(
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
        relations: { pack: true },
      });
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});