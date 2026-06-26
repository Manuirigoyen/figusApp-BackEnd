import { ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from '../../../src/common/filters/http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  describe('catch', () => {
    it('debería manejar una HttpException con status y mensaje personalizados', () => {
      const mockException = new HttpException(
        { message: 'Usuario no encontrado', error: 'Not Found' },
        HttpStatus.NOT_FOUND
      );

      let capturedResponse: any;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => { capturedResponse = data; }),
      } as unknown as Response;

      const mockRequest = {
        url: '/api/users/123',
        method: 'GET',
      } as unknown as Request;

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(capturedResponse).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Usuario no encontrado',
          path: '/api/users/123',
          method: 'GET',
          timestamp: expect.any(String),
        })
      );
    });

    it('debería manejar una HttpException con mensaje simple (string)', () => {
      const mockException = new HttpException('Bad request', HttpStatus.BAD_REQUEST);

      let capturedResponse: any;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => { capturedResponse = data; }),
      } as unknown as Response;

      const mockRequest = {
        url: '/api/posts',
        method: 'POST',
      } as unknown as Request;

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(capturedResponse).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad request',
          path: '/api/posts',
          method: 'POST',
        })
      );
    });

    it('debería manejar una excepción genérica (no HttpException) con default 500', () => {
      const mockException = new Error('Unexpected error');

      let capturedResponse: any;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => { capturedResponse = data; }),
      } as unknown as Response;

      const mockRequest = {
        url: '/api/albums',
        method: 'GET',
      } as unknown as Request;

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(capturedResponse).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          path: '/api/albums',
          method: 'GET',
        })
      );
    });

    it('debería manejar una HttpException donde response.message es undefined (fallback)', () => {
      const mockException = new HttpException(
        { error: 'Internal Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );

      let capturedResponse: any;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => { capturedResponse = data; }),
      } as unknown as Response;

      const mockRequest = {
        url: '/api/packs',
        method: 'PUT',
      } as unknown as Request;

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(capturedResponse).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          path: '/api/packs',
          method: 'PUT',
        })
      );
    });

    it('debería incluir timestamp válido en formato ISO', () => {
      const mockException = new HttpException('Error', HttpStatus.UNAUTHORIZED);

      let capturedResponse: any;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => { capturedResponse = data; }),
      } as unknown as Response;

      const mockRequest = {
        url: '/api/auth/login',
        method: 'POST',
      } as unknown as Request;

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ArgumentsHost;

      filter.catch(mockException, mockHost);

      expect(capturedResponse.timestamp).toBeDefined();
      expect(() => new Date(capturedResponse.timestamp)).not.toThrow();
      expect(capturedResponse.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});