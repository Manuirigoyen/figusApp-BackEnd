import { SetMetadata } from '@nestjs/common';

/**
 * Clave metadata para identificar rutas públicas
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas públicas (sin JWT requerido).
 * @example @Public() @Get('albums')
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);