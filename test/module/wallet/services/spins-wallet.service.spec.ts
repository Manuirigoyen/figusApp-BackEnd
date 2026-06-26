import { Test, TestingModule } from '@nestjs/testing';
import { SpinsWalletService } from '../../../../src/module/wallet/services//spins-wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpinsWallet } from '../../../../src/module/wallet/entities/spins-wallet.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('SpinsWalletService', () => {
  let service: SpinsWalletService;
  let repo: Repository<SpinsWallet>;

  const mockWallet = {
    id: 1,
    user_id: 1,
    stock: 100,
    user: {} as any,
  } as SpinsWallet;

  const updatedWallet = {
    ...mockWallet,
    stock: 200,
  } as SpinsWallet;

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
        SpinsWalletService,
        {
          provide: getRepositoryToken(SpinsWallet),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<SpinsWalletService>(SpinsWalletService);
    repo = module.get<Repository<SpinsWallet>>(
      getRepositoryToken(SpinsWallet),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a wallet', async () => {
      const dto = { user_id: 1, stock: 100 };

      mockRepo.create.mockReturnValue(mockWallet);
      mockRepo.save.mockResolvedValue(mockWallet);

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalledWith(mockWallet);
      expect(result).toEqual(mockWallet);
    });
  });

  describe('findAll', () => {
    it('should return all wallets', async () => {
      mockRepo.find.mockResolvedValue([mockWallet]);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockWallet]);
    });
  });

  describe('findOne', () => {
    it('should return a wallet if found', async () => {
      mockRepo.findOne.mockResolvedValue(mockWallet);

      const result = await service.findOne(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.findOne(999)).rejects.toThrow(
        'SpinsWallet #999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update and return wallet', async () => {
      const dto = { stock: 200 };

      mockRepo.findOne
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce(updatedWallet);

      mockRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, dto);

      expect(mockRepo.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedWallet);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { stock: 200 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove wallet', async () => {
      mockRepo.findOne.mockResolvedValue(mockWallet);

      mockRepo.delete.mockResolvedValue({
        affected: 1,
      });

      await expect(service.remove(1)).resolves.toBeUndefined();

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
