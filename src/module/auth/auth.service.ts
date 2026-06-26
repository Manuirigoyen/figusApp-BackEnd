import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express'; 
import { LoginUserDto } from '../users/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response, 
  ) {
    const result = await this.authService.login(loginDto);
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
      maxAge: 1000 * 60 * 60 * 24, 
    });
    
    return { success: true };
  }
}
