import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StoreService } from '../../../src/module/store/store.service';
import { Store, ProductType } from '../../../src/module/store/entities/store.entity';

describe('StoreService', () => {
  let service: StoreService;
  let repo: Repository<Store>;

  const expectedRelations = ['pack', 'comboItems', 'comboItems.pack'];

  const mockStore = {
    id: 1,
    pack_id: 2,
    name: 'Test Product',
    description: 'Test description',
    price_usd: '9.99',
    discount_usd: '0.00',
    discount_active: '0.00',
    stock_available: 10,
    cover_image: 'https://example.com/cover.jpg',
    product_type: ProductType.PACK,
    comboItems: [],
    purchases: [],
  } as unknown as Store;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getRepositoryToken(Store),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    repo = module.get<Repository<Store>>(getRepositoryToken(Store));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a store product', async () => {
      
      const dto = {
        pack_id: 2,
        name: 'Test Product',
        description: 'Test description',
        price_usd: 9.99,
        discount_usd: 0,
        discount_active: 0,
        stock_available: 10,
        cover_image: 'https://example.com/cover.jpg',
        product_type: ProductType.PACK,
      };

      mockRepo.create.mockReturnValue(mockStore);
      mockRepo.save.mockResolvedValue(mockStore);

      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalledWith(mockStore);
      expect(result).toEqual(mockStore);
    });
  });

  describe('findAll', () => {
    it('should return all stores with relations', async () => {
      mockRepo.find.mockResolvedValue([mockStore]);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({
        relations: expectedRelations,
      });
      expect(result).toEqual([mockStore]);
    });
  });

  describe('findOne', () => {
    it('should return a store product with relations', async () => {
      mockRepo.findOne.mockResolvedValue(mockStore);

      const result = await service.findOne(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expectedRelations,
      });
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and normalize a store product partially', async () => {
      const dto = {
        price_usd: 7.99,
      };

      mockRepo.findOne.mockResolvedValue(mockStore);
      mockRepo.save.mockResolvedValue({
        ...mockStore,
        price_usd: '7.99', 
      });

      const result = await service.update(1, dto);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expectedRelations,
      });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.price_usd).toBe('7.99');
    });
  });

  describe('remove', () => {
    it('should delete a store product if it exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockStore);
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expectedRelations,
      });
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException on remove if it does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});