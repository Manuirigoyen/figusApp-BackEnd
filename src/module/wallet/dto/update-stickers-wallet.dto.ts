import { PartialType } from "@nestjs/mapped-types";
import { CreateStickersWalletDto } from "../../wallet/dto/create-stickers-wallet.dto";

export class UpdateStickersWalletDto extends PartialType(CreateStickersWalletDto) {}
