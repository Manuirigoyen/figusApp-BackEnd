import { PartialType } from "@nestjs/mapped-types";
import { CreateSpinsWalletDto } from "../../wallet/dto/create-spins-wallet.dto";

export class UpdateSpinsWalletDto extends PartialType(CreateSpinsWalletDto) {}
