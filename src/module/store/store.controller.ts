import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ParseFloatPipe,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ProductType } from './entities/store.entity';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post(':id/purchase')
  @HttpCode(HttpStatus.OK)
  async purchase(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
    @Req() req: any,
  ) {
    const userId = req.user.id; 
    
    await this.storeService.purchaseProduct(userId, id, quantity);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Compra procesada exitosamente',
    };
  }

  @Roles('admin')
  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.storeService.findAll();
  }

  @Public()
  @Get('type/:productType')
  findByProductType(
    @Param('productType') productType: ProductType,
  ) {
    return this.storeService.findByProductType(productType);
  }

  @Public()
  @Get('discount')
  findWithDiscount() {
    return this.storeService.findWithDiscount();
  }

  @Public()
  @Get('price-range')
  findByPriceRange(
    @Query('minPrice', ParseFloatPipe) minPrice: number,
    @Query('maxPrice', ParseFloatPipe) maxPrice: number,
  ) {
    return this.storeService.findByPriceRange(minPrice, maxPrice);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storeService.update(id, updateStoreDto);
  }

  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.remove(id);
  }
}
