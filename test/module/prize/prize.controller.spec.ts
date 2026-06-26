import { Test, TestingModule } from '@nestjs/testing';

import { PrizeController } from '../../../src/module/prize/prize.controller';
import { PrizeService } from '../../../src/module/prize/prize.service';

describe('PrizeController', () => {
  let controller: PrizeController;

  const mockPrizeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(), 
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrizeController],
      providers: [
        {
          provide: PrizeService,
          useValue: mockPrizeService,
        },
      ],
    }).compile();

    controller = module.get<PrizeController>(PrizeController);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a prize', async () => {
      const dto = {
        id_sticker: 9,
        id_packs_bronce: 1,
        id_packs_plateado: 4,
        id_packs_dorado: 7,
        spins: 5,
      };

      const result = {
        id: 1,
        ...dto,
      };

      mockPrizeService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockPrizeService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all prizes', async () => {
      const result = [{ id: 1, id_sticker: 9, spins: 5 }];

      mockPrizeService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockPrizeService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one prize', async () => {
      const result = {
        id: 1,
        id_sticker: 9,
        id_packs_bronce: 1,
        id_packs_plateado: 4,
        id_packs_dorado: 7,
        spins: 5,
      };

      mockPrizeService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(mockPrizeService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a prize partialy', async () => {
      const updateDto = {
        spins: 10, 
      };

      const result = {
        id: 1,
        id_sticker: 9,
        id_packs_bronce: 1,
        id_packs_plateado: 4,
        id_packs_dorado: 7,
        spins: 10, 
      };

      mockPrizeService.update.mockResolvedValue(result);

      expect(await controller.update(1, updateDto)).toEqual(result);
      expect(mockPrizeService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove prize', async () => {
      mockPrizeService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(mockPrizeService.remove).toHaveBeenCalledWith(1);
    });
  });
});