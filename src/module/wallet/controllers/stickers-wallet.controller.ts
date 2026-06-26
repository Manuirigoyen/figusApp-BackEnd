import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StickersWalletService } from './../services/stickers-wallet.service';
import { CreateStickersWalletDto } from './../dto/create-stickers-wallet.dto';
import { UpdateStickersWalletDto } from './../dto/update-stickers-wallet.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('stickers-wallet')
export class StickersWalletController {
  constructor(
    private readonly stickersWalletService: StickersWalletService,
  ) {}

  private getUserId(req: any): number {
    return Number(req.user?.id ?? req.user?.userId ?? req.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyWallet(@Req() req: any) {
    const userId = this.getUserId(req);

    return this.stickersWalletService.findByUser(userId);
  }

  @Roles('admin')
  @Post()
  create(@Body() createStickersWalletDto: CreateStickersWalletDto) {
    return this.stickersWalletService.create(createStickersWalletDto);
  }

  @Get()
  findAll() {
    return this.stickersWalletService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stickersWalletService.findOne(id);
  }

  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStickersWalletDto: UpdateStickersWalletDto,
  ) {
    return this.stickersWalletService.update(id, updateStickersWalletDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/decrement')
  decrementStock(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);

    return this.stickersWalletService.decrementStock(id, userId);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stickersWalletService.remove(id);
  }
}