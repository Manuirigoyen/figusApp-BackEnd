import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateOfferDto {
  @IsInt()
  @IsNotEmpty()
  offer_wallet_id!: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  offered_quantity!: number;

  @IsInt()
  @IsNotEmpty()
  request_sticker_id!: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  request_quantity!: number;
}