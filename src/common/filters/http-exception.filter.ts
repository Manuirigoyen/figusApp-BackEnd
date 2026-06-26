import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones que captura cualquier error ocurrido durante el ciclo de vida de la solicitud.
 * Estandariza la respuesta de error enviada al cliente asegurando un formato JSON consistente.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Captura y procesa las excepciones lanzadas en la aplicación.
   * @param {unknown} exception - La excepción capturada.
   * @param {ArgumentsHost} host - Objeto de acceso a los contextos de la solicitud y respuesta.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      this.logger.error(`Error no controlado: ${exception instanceof Error ? exception.message : String(exception)}`);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message,
    });
  }
}