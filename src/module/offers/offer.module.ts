import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OffersService } from './offert.service';
import { OffersController } from './offer.controller';

import { Offer } from './entities/offer.entity';
import { OfferRejection } from './entities/offer-rejection.entity';
import { StickersWallet } from '../wallet/entities/stickers-wallet.entity';
import { Sticker } from '../stickers/entities/sticker.entity';
import { Exchange } from '../exchanges/entities/exchanges.entity';
import { UserAlbumSticker } from '../albums/entities/user-album-sticker.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      OfferRejection,
      StickersWallet,
      Sticker,
      Exchange,
      UserAlbumSticker,
    ]),
    UploadsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}