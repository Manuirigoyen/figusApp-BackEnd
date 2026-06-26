import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OffersService } from './offert.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  private getUserId(req: any): number {
    return req.user.id ?? req.user.userId ?? req.user.sub;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Req() req: any) {
    return this.offersService.create(createOfferDto, this.getUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  findPendingOffers(@Req() req: any) {
    return this.offersService.findPendingOffers(this.getUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/accept')
  acceptOffer(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.offersService.acceptOffer(id, this.getUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reject')
  rejectOffer(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.offersService.rejectOffer(id, this.getUserId(req));
  }

  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @Get('user/:userId/active')
  existsActiveByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.offersService.existsActiveByUserId(userId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.offersService.findByUserId(userId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.offersService.findByStatus(status as any);
  }

  @Get('active/count')
  countActive() {
    return this.offersService.countActive();
  }

  @Get('expiring-soon')
  findExpiringSoon() {
    return this.offersService.findExpiringSoon();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.findOne(id);
  }

  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offersService.update(id, updateOfferDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.offersService.remove(id, this.getUserId(req));
  }
}