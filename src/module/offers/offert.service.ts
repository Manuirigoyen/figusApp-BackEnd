import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, LessThan, Repository } from 'typeorm';

import { Offer, OfferStatus, OfferType } from './entities/offer.entity';
import { OfferRejection } from './entities/offer-rejection.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

import { Exchange, ExchangeStatus } from '../exchanges/entities/exchanges.entity';
import { StickersWallet } from '../wallet/entities/stickers-wallet.entity';
import { Sticker } from '../stickers/entities/sticker.entity';
import { UserAlbumSticker } from '../albums/entities/user-album-sticker.entity';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,

    @InjectRepository(OfferRejection)
    private readonly offerRejectionRepository: Repository<OfferRejection>,

    @InjectRepository(StickersWallet)
    private readonly stickersWalletRepository: Repository<StickersWallet>,

    @InjectRepository(Sticker)
    private readonly stickerRepository: Repository<Sticker>,

    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,

    private readonly dataSource: DataSource,

    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Resuelve en lote las imágenes de la figurita ofrecida (offerWallet.sticker)
   * y la figurita solicitada (requestSticker) para una lista de ofertas/items
   * ya mapeados hacia el frontend, sin mutar los objetos originales.
   */
  private async resolveOfferListImages<
    T extends { offerWallet?: StickersWallet | null; requestSticker?: Sticker | null },
  >(items: T[]): Promise<T[]> {
    const covers: Array<string | null | undefined> = [];

    items.forEach((item) => {
      covers.push(item.offerWallet?.sticker?.cover_image ?? null);
      covers.push(item.requestSticker?.cover_image ?? null);
    });

    const resolved = await this.uploadsService.resolveManyImageUrls(covers);

    return items.map((item, index) => {
      const offerCover = resolved[index * 2];
      const requestCover = resolved[index * 2 + 1];

      return {
        ...item,
        offerWallet: item.offerWallet
          ? {
              ...item.offerWallet,
              sticker: item.offerWallet.sticker
                ? { ...item.offerWallet.sticker, cover_image: offerCover }
                : item.offerWallet.sticker,
            }
          : item.offerWallet,
        requestSticker: item.requestSticker
          ? { ...item.requestSticker, cover_image: requestCover }
          : item.requestSticker,
      };
    });
  }

  async create(createOfferDto: CreateOfferDto, userId: number): Promise<Offer> {
    const offerWalletId = Number(createOfferDto.offer_wallet_id);
    const offeredQuantity = Number(createOfferDto.offered_quantity);
    const requestStickerId = Number(createOfferDto.request_sticker_id);
    const requestQuantity = Number(createOfferDto.request_quantity);

    const offerWallet = await this.stickersWalletRepository.findOne({
      where: {
        id: offerWalletId,
        user_id: Number(userId),
      },
      relations: ['sticker'],
    });

    if (!offerWallet) {
      throw new BadRequestException(
        'La wallet de oferta no pertenece al usuario autenticado',
      );
    }

    if (offeredQuantity < 1 || offerWallet.stock < offeredQuantity) {
      throw new BadRequestException(
        'No tenés stock suficiente para publicar esta oferta',
      );
    }

    const requestSticker = await this.stickerRepository.findOne({
      where: { id: requestStickerId },
    });

    if (!requestSticker) {
      throw new NotFoundException('La figurita solicitada no existe');
    }

    if (requestQuantity < 1) {
      throw new BadRequestException('La cantidad solicitada debe ser mayor a 0');
    }

    const dateExpires = new Date();
    dateExpires.setDate(dateExpires.getDate() + 7);

    const offer = this.offerRepository.create({
      offerer_user_id: Number(userId),
      offer_wallet_id: offerWalletId,
      offered_sticker_id: offerWallet.sticker.id,
      offered_sticker_name: offerWallet.sticker.name,
      offered_quantity: offeredQuantity,
      offered: OfferType.STICKER,
      request: OfferType.STICKER,
      request_sticker_id: requestStickerId,
      request_sticker_name: requestSticker.name,
      request_quantity: requestQuantity,
      status: OfferStatus.PENDING,
      date_expires: dateExpires,
    });

    return this.offerRepository.save(offer);
  }

  async findAll(): Promise<Offer[]> {
    return this.offerRepository.find({
      relations: [
        'user',
        'offerWallet',
        'offerWallet.sticker',
        'requestSticker',
        'exchanges',
      ],
      order: { date_created: 'DESC' },
    });
  }

  async findPendingOffers(userId: number): Promise<any[]> {
    const rejectedOffers = await this.offerRejectionRepository.find({
      where: {
        user_id: Number(userId),
      },
    });

    const rejectedOfferIds = rejectedOffers.map(
      (rejection) => rejection.offer_id,
    );

    const offers = await this.offerRepository.find({
      where: {
        status: OfferStatus.PENDING,
      },
      relations: [
        'user',
        'offerWallet',
        'offerWallet.sticker',
        'offeredSticker',
        'requestSticker',
      ],
      order: {
        date_created: 'DESC',
      },
    });

    const mapped = offers
      .filter((offer) => !rejectedOfferIds.includes(offer.id))
      .map((offer) => ({
        id: offer.id,
        offered_quantity: offer.offered_quantity,
        request_quantity: offer.request_quantity,
        status: offer.status,
        isMine: offer.offerer_user_id === Number(userId),
        offererUser: {
          id: offer.user.id,
          first_name: offer.user.first_name,
          last_name: offer.user.last_name,
        },
        offerWallet: offer.offerWallet,
        requestSticker: offer.requestSticker,
        offered_sticker_name: this.resolveOfferedStickerName(offer),
        request_sticker_name: this.resolveRequestStickerName(offer),
      }));

    return this.resolveOfferListImages(mapped);
  }

  /**
   * Historial de intercambios del usuario autenticado:
   * - Ofertas que el usuario creó y siguen pendientes o ya fueron aceptadas.
   * - Ofertas de otros usuarios que el usuario aceptó (reconstruidas desde Exchange).
   * - Ofertas de otros usuarios que el usuario rechazó (vía OfferRejection).
   *
   * El rechazo es individual: no cambia el estado global de la oferta
   * (sigue disponible para que otro usuario la acepte), pero igualmente
   * queda registrado en el historial personal de quien la rechazó.
   * No incluye eliminadas (se borran físicamente al hacer remove()).
   */
  async findMyHistory(userId: number): Promise<any[]> {
    const id = Number(userId);

    const myOffers = await this.offerRepository.find({
      where: {
        offerer_user_id: id,
        status: In([OfferStatus.PENDING, OfferStatus.ACCEPTED]),
      },
      relations: ['user', 'offerWallet', 'offerWallet.sticker', 'offeredSticker', 'requestSticker'],
      order: { date_created: 'DESC' },
    });

    const myAcceptedExchanges = await this.exchangeRepository.find({
      where: { accepter_user_id: id },
      relations: [
        'offer',
        'offer.user',
        'offer.offerWallet',
        'offer.offerWallet.sticker',
        'offer.offeredSticker',
        'offer.requestSticker',
        'offeredWallet',
        'offeredWallet.sticker',
        'offeredSticker',
        'receivedWallet',
        'receivedWallet.sticker',
        'receivedSticker',
      ],
      order: { date_completed: 'DESC' },
    });

    const myOfferedExchanges = await this.exchangeRepository.find({
      where: { offer: { offerer_user_id: id } },
      relations: [
        'offer',
        'offer.user',
        'offer.offerWallet',
        'offer.offerWallet.sticker',
        'offer.offeredSticker',
        'offer.requestSticker',
        'offeredWallet',
        'offeredWallet.sticker',
        'offeredSticker',
        'receivedWallet',
        'receivedWallet.sticker',
        'receivedSticker',
      ],
      order: { date_completed: 'DESC' },
    });

    const exchangeByOfferId = new Map<number, Exchange>();
    for (const exchange of [...myAcceptedExchanges, ...myOfferedExchanges]) {
      if (exchange.offer_id) {
        exchangeByOfferId.set(exchange.offer_id, exchange);
      }
    }

    const acceptedOffers = myAcceptedExchanges
      .map((exchange) => exchange.offer)
      .filter((offer): offer is Offer => Boolean(offer));

    const myRejections = await this.offerRejectionRepository.find({
      where: { user_id: id },
    });

    const rejectedOfferIds = myRejections.map((rejection) => rejection.offer_id);

    const rejectedOffers = rejectedOfferIds.length
      ? await this.offerRepository.find({
          where: { id: In(rejectedOfferIds) },
          relations: ['user', 'offerWallet', 'offerWallet.sticker', 'offeredSticker', 'requestSticker'],
        })
      : [];

    const combined = new Map<number, any>();

    for (const offer of myOffers) {
      combined.set(
        offer.id,
        this.mapOfferToHistoryItem(offer, id, 'offerer', exchangeByOfferId.get(offer.id)),
      );
    }

    for (const offer of rejectedOffers) {
      combined.set(offer.id, this.mapOfferToHistoryItem(offer, id, 'rejecter'));
    }

    for (const offer of acceptedOffers) {
      combined.set(
        offer.id,
        this.mapOfferToHistoryItem(offer, id, 'accepter', exchangeByOfferId.get(offer.id)),
      );
    }

    const historyItems = await this.resolveOfferListImages(
      Array.from(combined.values()),
    );

    return historyItems.sort((a, b) => {
      return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
    });
  }

  private mapOfferToHistoryItem(
    offer: Offer,
    userId: number,
    role: 'offerer' | 'accepter' | 'rejecter',
    exchange?: Exchange,
  ) {
    return {
      id: offer.id,
      offered_quantity: offer.offered_quantity,
      request_quantity: offer.request_quantity,
      // Para "rejecter" mostramos el estado desde la perspectiva del usuario
      // (la oferta real puede seguir "pending" para otros), no su status global.
      status: role === 'rejecter' ? OfferStatus.REJECTED : offer.status,
      date_created: offer.date_created,
      date_expires: offer.date_expires,
      isMine: offer.offerer_user_id === userId,
      role,
      offererUser: {
        id: offer.user.id,
        first_name: offer.user.first_name,
        last_name: offer.user.last_name,
      },
      offerWallet: offer.offerWallet,
      requestSticker: offer.requestSticker,
      offered_sticker_name: this.resolveOfferedStickerName(offer, exchange),
      request_sticker_name: this.resolveRequestStickerName(offer, exchange),
    };
  }

  private resolveOfferedStickerName(
    offer: Offer,
    exchange?: Exchange,
  ): string | null {
    return (
      offer.offered_sticker_name ??
      exchange?.offered_sticker_name ??
      offer.offerWallet?.sticker?.name ??
      exchange?.offeredWallet?.sticker?.name ??
      offer.offeredSticker?.name ??
      exchange?.offeredSticker?.name ??
      null
    );
  }

  private resolveRequestStickerName(
    offer: Offer,
    exchange?: Exchange,
  ): string | null {
    return (
      offer.request_sticker_name ??
      exchange?.received_sticker_name ??
      offer.requestSticker?.name ??
      exchange?.receivedWallet?.sticker?.name ??
      exchange?.receivedSticker?.name ??
      null
    );
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id: Number(id) },
      relations: [
        'user',
        'offerWallet',
        'offerWallet.sticker',
        'requestSticker',
        'exchanges',
      ],
    });

    if (!offer) {
      throw new NotFoundException(`Offer #${id} not found`);
    }

    return offer;
  }

  async findByUserId(userId: number): Promise<Offer[]> {
    return this.offerRepository.find({
      where: { offerer_user_id: Number(userId) },
      relations: [
        'user',
        'offerWallet',
        'offerWallet.sticker',
        'requestSticker',
        'exchanges',
      ],
      order: { date_created: 'DESC' },
    });
  }

  async findByStatus(status: OfferStatus): Promise<Offer[]> {
    return this.offerRepository.find({
      where: { status },
      relations: [
        'user',
        'offerWallet',
        'offerWallet.sticker',
        'requestSticker',
        'exchanges',
      ],
      order: { date_created: 'DESC' },
    });
  }

  async acceptOffer(offerId: number, accepterUserId: number): Promise<Exchange> {
    return this.dataSource.transaction(async (manager) => {
      const lockedOffer = await manager.findOne(Offer, {
        where: {
          id: Number(offerId),
          status: OfferStatus.PENDING,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedOffer) {
        throw new NotFoundException('Oferta no encontrada o no disponible');
      }

      const offer = await manager.findOne(Offer, {
        where: { id: lockedOffer.id },
        relations: [
          'user',
          'offerWallet',
          'offerWallet.sticker',
          'requestSticker',
        ],
      });

      if (!offer) {
        throw new NotFoundException('Oferta no encontrada o no disponible');
      }

      if (offer.offerer_user_id === Number(accepterUserId)) {
        throw new BadRequestException('No podés aceptar tu propia oferta');
      }

      if (!offer.offerWallet || !offer.offerWallet.sticker) {
        throw new BadRequestException('La oferta no tiene una figurita válida');
      }

      if (!offer.requestSticker) {
        throw new BadRequestException('Sticker solicitado no encontrado');
      }

      if (offer.offerWallet.stock < offer.offered_quantity) {
        throw new BadRequestException('El oferente ya no tiene stock suficiente');
      }

      const accepterDemandWallet = await manager.findOne(StickersWallet, {
        where: {
          user_id: Number(accepterUserId),
          sticker_id: offer.requestSticker.id,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (
        !accepterDemandWallet ||
        accepterDemandWallet.stock < offer.request_quantity
      ) {
        throw new BadRequestException(
          'No tenés stock suficiente para aceptar esta oferta',
        );
      }

      offer.offerWallet.stock -= offer.offered_quantity;
      accepterDemandWallet.stock -= offer.request_quantity;

      await this.saveWalletItem(manager, offer.offerWallet);
      await this.saveWalletItem(manager, accepterDemandWallet);

      await this.addStickerToUser(
        manager,
        Number(accepterUserId),
        offer.offerWallet.sticker.id,
        offer.offered_quantity,
      );

      await this.addStickerToUser(
        manager,
        offer.offerer_user_id,
        offer.requestSticker.id,
        offer.request_quantity,
      );

      offer.status = OfferStatus.ACCEPTED;
      if (!offer.offered_sticker_id) {
        offer.offered_sticker_id = offer.offerWallet.sticker.id;
      }
      if (!offer.offered_sticker_name) {
        offer.offered_sticker_name = offer.offerWallet.sticker.name;
      }
      if (!offer.request_sticker_name && offer.requestSticker) {
        offer.request_sticker_name = offer.requestSticker.name;
      }
      await manager.save(offer);

      const exchange = manager.create(Exchange, {
        offer_id: offer.id,
        accepter_user_id: Number(accepterUserId),
        offered_quantity: offer.offered_quantity,
        received_quantity: offer.request_quantity,
        date_completed: new Date(),
        status: ExchangeStatus.COMPLETED,
        offeredWallet: offer.offerWallet,
        receivedWallet: accepterDemandWallet,
        offered_sticker_id: offer.offerWallet.sticker.id,
        offered_sticker_name: offer.offerWallet.sticker.name,
        received_sticker_id: offer.requestSticker.id,
        received_sticker_name: offer.requestSticker.name,
      });

      return manager.save(exchange);
    });
  }

  async rejectOffer(offerId: number, userId: number): Promise<void> {
    const offer = await this.findOne(Number(offerId));

    if (offer.offerer_user_id === Number(userId)) {
      throw new BadRequestException('No podés rechazar tu propia oferta');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Solo se pueden rechazar ofertas pendientes');
    }

    const alreadyRejected = await this.offerRejectionRepository.findOne({
      where: {
        offer_id: Number(offerId),
        user_id: Number(userId),
      },
    });

    if (alreadyRejected) return;

    const rejection = this.offerRejectionRepository.create({
      offer_id: Number(offerId),
      user_id: Number(userId),
    });

    await this.offerRejectionRepository.save(rejection);
  }

  async countActive(): Promise<number> {
    return this.offerRepository.count({
      where: {
        status: OfferStatus.PENDING,
      },
    });
  }

  async update(id: number, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.findOne(Number(id));
    Object.assign(offer, updateOfferDto);
    return this.offerRepository.save(offer);
  }

  async remove(id: number, userId: number, role?: string): Promise<void> {
    const offer = await this.findOne(Number(id));

    const isOwner = offer.offerer_user_id === Number(userId);
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No podés eliminar una oferta que no es tuya');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Solo se pueden eliminar ofertas pendientes');
    }

    await this.offerRepository.delete(Number(id));
  }

  async existsActiveByUserId(userId: number): Promise<boolean> {
    const count = await this.offerRepository.count({
      where: {
        offerer_user_id: Number(userId),
        status: OfferStatus.PENDING,
      },
    });

    return count > 0;
  }

  async findExpiringSoon(): Promise<Offer[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.offerRepository.find({
      where: {
        status: OfferStatus.PENDING,
        date_expires: LessThan(tomorrow),
      },
      relations: ['user', 'offerWallet', 'offerWallet.sticker', 'offeredSticker', 'requestSticker'],
      order: { date_created: 'DESC' },
    });
  }

  private async addStickerToUser(
    manager: EntityManager,
    userId: number,
    stickerId: number,
    quantity: number,
  ): Promise<void> {
    const sticker = await manager.findOne(Sticker, {
      where: { id: Number(stickerId) },
    });

    if (!sticker) {
      throw new NotFoundException(`Sticker #${stickerId} no encontrado`);
    }

    if (quantity <= 0) return;

    const alreadyInAlbum = await manager.findOne(UserAlbumSticker, {
      where: {
        user_id: Number(userId),
        album_id: sticker.album_id,
        sticker_id: sticker.id,
      },
    });

    if (!alreadyInAlbum) {
      const albumSticker = manager.create(UserAlbumSticker, {
        user_id: Number(userId),
        album_id: sticker.album_id,
        sticker_id: sticker.id,
      });

      await manager.save(albumSticker);
      quantity -= 1;
    }

    if (quantity > 0) {
      let walletItem = await manager.findOne(StickersWallet, {
        where: {
          user_id: Number(userId),
          sticker_id: sticker.id,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (walletItem) {
        walletItem.stock += quantity;
      } else {
        walletItem = manager.create(StickersWallet, {
          user_id: Number(userId),
          sticker_id: sticker.id,
          stock: quantity,
        });
      }

      await manager.save(walletItem);
    }
  }

  private async saveWalletItem(
    manager: EntityManager,
    walletItem: StickersWallet,
  ): Promise<void> {
    if (walletItem.stock < 0) {
      walletItem.stock = 0;
    }

    await manager.save(walletItem);
  }
}