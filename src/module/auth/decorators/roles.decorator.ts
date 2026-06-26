import { SetMetadata } from '@nestjs/common';

/**
 * Clave metadata para roles requeridos
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para requerir roles específicos.
 * @param roles - roles permitidos (ej: 'admin')
 * @example @Roles('admin') @Post('albums')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);