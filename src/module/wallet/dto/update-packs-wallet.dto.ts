import { PartialType } from "@nestjs/mapped-types";
import { CreatePacksWalletDto } from "../../wallet/dto/create-packs-wallet.dto";

export class UpdatePacksWalletDto extends PartialType(CreatePacksWalletDto) {}
