import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from '../../../src/module/uploads/uploads.service';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    rm: jest.fn(),
    stat: jest.fn(),
  },
}));

import { promises as fs } from 'fs';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
    }).compile();

    service = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  describe('createUserDirectory', () => {
    it('should create a directory and return its path', async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const result = await service.createUserDirectory(123);

      expect(fs.mkdir).toHaveBeenCalled();

      expect(typeof result).toBe('string');

      expect(result).toContain('uploads');
      expect(result).toContain('private');
      expect(result).toContain('users');
      expect(result).toContain('123');
    });

    it('should propagate errors from fs.mkdir', async () => {
      const error = new Error('disk full');

      (fs.mkdir as jest.Mock).mockRejectedValue(error);

      await expect(
        service.createUserDirectory(5),
      ).rejects.toThrow('disk full');
    });
  });
});