import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from '../../../src/module/store/store.controller';
import { StoreService } from '../../../src/module/store/store.service';
import { CreateStoreDto } from '../../../src/module/store/dto/create-store.dto';
import { UpdateStoreDto } from '../../../src/module/store/dto/update-store.dto';
import { Store, ProductType } from '../../../src/module/store/entities/store.entity';

describe('StoreController', () => {
  let controller: StoreController;
  let service: StoreService;


  const mockStore = {
    id: 1,
    pack_id: 2, 
    name: 'Sobre Común',
    description: 'Sobre básico',
    product_type: ProductType.PACK,
    price_usd: '9.99',
    discount_usd: '0.00',
    discount_active: '0.00',
    stock_available: 100,
    cover_image: 'https://example.com/cover.jpg',
    comboItems: [], 
    purchases: [],
  } as Store;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProductType: jest.fn(),
    findByPriceRange: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findWithDiscount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: StoreService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<StoreController>(StoreController);
    service = module.get<StoreService>(StoreService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      // DTO limpio y sincronizado
      const dto: CreateStoreDto = {
        pack_id: 2,
        name: 'Sobre Común',
        description: 'Sobre básico',
        product_type: ProductType.PACK,
        price_usd: 9.99,
        cover_image: 'https://example.com/cover.jpg',
      };

      mockService.create.mockResolvedValue(mockStore);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockStore);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      mockService.findAll.mockResolvedValue([mockStore]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockStore]);
    });
  });

  describe('findByProductType', () => {
    it('should call service.findByProductType', async () => {
      mockService.findByProductType.mockResolvedValue([mockStore]);

      const result = await controller.findByProductType(ProductType.PACK);

      expect(service.findByProductType).toHaveBeenCalledWith(ProductType.PACK);
      expect(result).toEqual([mockStore]);
    });
  });

  describe('findWithDiscount', () => {
    it('should call service.findWithDiscount', async () => {
      const discounted = { ...mockStore, discount_active: '2.50' };

      mockService.findWithDiscount.mockResolvedValue([discounted]);

      const result = await controller.findWithDiscount();

      expect(service.findWithDiscount).toHaveBeenCalled();
      expect(result).toEqual([discounted]);
    });
  });

  describe('findByPriceRange', () => {
    it('should call service.findByPriceRange', async () => {
      mockService.findByPriceRange.mockResolvedValue([mockStore]);

      // Modificado a decimales para validar el soporte de ParseFloatPipe
      const result = await controller.findByPriceRange(5.5, 15.9);

      expect(service.findByPriceRange).toHaveBeenCalledWith(5.5, 15.9);
      expect(result).toEqual([mockStore]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      mockService.findOne.mockResolvedValue(mockStore);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStore);
    });
  });

  describe('update', () => {
    it('should call service.update (PATCH)', async () => {
      const dto: UpdateStoreDto = { price_usd: 7.99 };

      const updated = { ...mockStore, price_usd: '7.99' };

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