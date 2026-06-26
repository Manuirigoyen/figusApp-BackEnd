import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { Public } from '../auth/decorators/public.decorator';
import { LoginUserDto } from './../users/dto/login-user.dto';

/**
 * Controlador de Autenticación.
 * * Gestiona el ciclo de vida de la sesión del usuario mediante cookies HTTP-only,
 * incluyendo inicio de sesión, validación de estado y cierre de sesión.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  /**
   * Inicia sesión de usuario y establece una cookie de autenticación.
   * * @param {LoginUserDto} user - Credenciales del usuario (email y contraseña).
   * * @param {Response} response - Objeto de respuesta de Express para configurar la cookie.
   * * @returns {Promise<{access_token: string, message: string}>} Resultado de la operación.
   */
  @Public()
  @Post('login')
  async login(
    @Body() user: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(user);

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, 
    });

    return {
      access_token: result.access_token,
      message: 'Login exitoso.',
    };
  }

  /**
   * Valida si el token actual es válido.
   * * @returns {Object} Estado de autenticación.
   */
  @Get('validate')
  validate() {
    return { authenticated: true };
  }

  /**
   * Obtiene la información del usuario autenticado actualmente.
   * * @param {Request} request - Solicitud entrante que contiene los datos del usuario en el objeto 'user'.
   * * @returns {Promise<any>} Perfil del usuario autenticado.
   */
  @Get('me')
  me(@Req() request: Request) {
    return this.authService.me((request as any).user.userId);
  }

  /**
   * Cierra la sesión del usuario eliminando la cookie de autenticación.
   * * @param {Response} response - Objeto de respuesta para limpiar la cookie.
   * * @returns {Object} Mensaje de confirmación.
   */
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
    });

    return { message: 'Logout exitoso.' };
  }
}