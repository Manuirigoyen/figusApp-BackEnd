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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() user: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(user);

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24, 
    });

    return {
      access_token: result.access_token,
      message: 'Login exitoso.',
    };
  }

  @Get('validate')
  validate() {
    return { authenticated: true };
  }

  @Get('me')
  me(@Req() request: Request) {
    return this.authService.me((request as any).user.userId);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return { message: 'Logout exitoso.' };
  }
}
