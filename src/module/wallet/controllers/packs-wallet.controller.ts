import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { PacksWalletService } from "./../services/packs-wallet.service";
import { CreatePacksWalletDto } from "./../dto/create-packs-wallet.dto";
import { UpdatePacksWalletDto } from "./../dto/update-packs-wallet.dto";
import { Roles } from "../../auth/decorators/roles.decorator";
import { PacksWallet } from "./../entities/packs-wallet.entity";
import { AuthGuard } from "@nestjs/passport";

@Controller("packs-wallet")
export class PacksWalletController {
  constructor(private readonly packsWalletService: PacksWalletService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post()
  create(
    @Body() createPacksWalletDto: CreatePacksWalletDto,
  ): Promise<PacksWallet> {
    return this.packsWalletService.create(createPacksWalletDto);
  }

  @Get()
  findAll(): Promise<PacksWallet[]> {
    return this.packsWalletService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<PacksWallet> {
    return this.packsWalletService.findOne(id);
  }

  @Roles("admin")
  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePacksWalletDto: UpdatePacksWalletDto,
  ): Promise<PacksWallet> {
    return this.packsWalletService.update(id, updatePacksWalletDto);
  }

  @Roles("admin")
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.packsWalletService.remove(id);
  }
}
