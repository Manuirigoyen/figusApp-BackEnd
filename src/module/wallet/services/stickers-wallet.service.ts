import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateStickersWalletDto } from "./../dto/create-stickers-wallet.dto";
import { UpdateStickersWalletDto } from "./../dto/update-stickers-wallet.dto";
import { StickersWallet } from "./../entities/stickers-wallet.entity";
import { Offer, OfferStatus } from "../../offers/entities/offer.entity";
import { Exchange } from "../../exchanges/entities/exchanges.entity";
import { UploadsService } from "../../uploads/uploads.service";

/**
 * Servicio de Billetera de Stickers (StickersWalletService).
 * * Gestiona el inventario de figuritas (stickers) por usuario,
 * incluyendo operaciones CRUD y lógica de control de stock.
 */
@Injectable()
export class StickersWalletService {
  constructor(
    @InjectRepository(StickersWallet)
    private readonly stickersWalletRepository: Repository<StickersWallet>,

    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,

    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,

    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Resuelve las URLs de imagen (cover_image) de los stickers relacionados
   * a una lista de registros de billetera, devolviendo copias nuevas de los
   * objetos con el campo ya listo para el frontend.
   */
  private async resolveWalletImages(
    wallets: StickersWallet[],
  ): Promise<StickersWallet[]> {
    const resolvedCovers = await this.uploadsService.resolveManyImageUrls(
      wallets.map((wallet) => wallet.sticker?.cover_image ?? null),
    );

    return wallets.map((wallet, index) => {
      if (!wallet.sticker) return wallet;

      return {
        ...wallet,
        sticker: {
          ...wallet.sticker,
          cover_image: resolvedCovers[index],
        },
      };
    });
  }

  /**
   * Agrega un nuevo registro de figurita a la billetera de un usuario.
   * * @param createStickersWalletDto Datos del ítem a agregar.
   * * @returns {Promise<StickersWallet>} El registro creado.
   */
  create(
    createStickersWalletDto: CreateStickersWalletDto,
  ): Promise<StickersWallet> {
    const wallet = this.stickersWalletRepository.create(
      createStickersWalletDto,
    );
    return this.stickersWalletRepository.save(wallet);
  }

  /**
   * Obtiene todos los ítems de billeteras existentes con sus relaciones.
   */
  async findAll(): Promise<StickersWallet[]> {
    const wallets = await this.stickersWalletRepository.find({
      relations: { sticker: true },
    });

    return this.resolveWalletImages(wallets);
  }

  /**
   * Obtiene todas las figuritas pertenecientes a un usuario específico.
   * * @param userId ID del usuario.
   */
  async findByUser(userId: number): Promise<StickersWallet[]> {
    const wallets = await this.stickersWalletRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        sticker: true,
      },
    });

    return this.resolveWalletImages(wallets);
  }

  /**
   * Busca un ítem específico de la billetera por su ID.
   * * @throws {NotFoundException} Si el ítem no existe.
   */
  async findOne(id: number): Promise<StickersWallet> {
    const wallet = await this.stickersWalletRepository.findOne({
      where: { id },
      relations: { sticker: true },
    });

    if (!wallet) {
      throw new NotFoundException(`StickersWallet with ID ${id} not found`);
    }

    const [resolved] = await this.resolveWalletImages([wallet]);
    return resolved;
  }

  /**
   * Actualiza los datos de un ítem en la billetera.
   */
  async update(
    id: number,
    updateStickersWalletDto: UpdateStickersWalletDto,
  ): Promise<StickersWallet> {
    await this.findOne(id);
    await this.stickersWalletRepository.update(id, updateStickersWalletDto);
    return this.findOne(id);
  }

  /**
   * Verifica si la wallet tiene una oferta pendiente activa.
   * * @throws {BadRequestException} Si hay una oferta activa que la usa.
   */
  private async checkActiveOffer(walletId: number): Promise<void> {
    const activeOffer = await this.offerRepository.findOne({
      where: {
        offer_wallet_id: walletId,
        status: OfferStatus.PENDING,
      },
    });

    if (activeOffer) {
      throw new BadRequestException(
        'No podés eliminar esta figurita porque tiene un intercambio activo. Cancelá la oferta primero.',
      );
    }
  }

  /**
   * Copia el sticker ofrecido a columnas denormalizadas antes de anular
   * offer_wallet_id, para que el historial conserve el nombre.
   */
  private async preserveOfferStickerSnapshot(walletId: number): Promise<void> {
    const wallet = await this.stickersWalletRepository.findOne({
      where: { id: walletId },
      relations: { sticker: true },
    });

    if (!wallet?.sticker) return;

    await this.offerRepository
      .createQueryBuilder()
      .update()
      .set({
        offered_sticker_id: wallet.sticker.id,
        offered_sticker_name: wallet.sticker.name,
      })
      .where('offer_wallet_id = :walletId', { walletId })
      .andWhere('(offered_sticker_id IS NULL OR offered_sticker_name IS NULL)')
      .execute();

    await this.exchangeRepository
      .createQueryBuilder()
      .update()
      .set({
        offered_sticker_id: wallet.sticker.id,
        offered_sticker_name: wallet.sticker.name,
      })
      .where('offered_wallet_id = :walletId', { walletId })
      .andWhere('(offered_sticker_id IS NULL OR offered_sticker_name IS NULL)')
      .execute();

    await this.exchangeRepository
      .createQueryBuilder()
      .update()
      .set({
        received_sticker_id: wallet.sticker.id,
        received_sticker_name: wallet.sticker.name,
      })
      .where('received_wallet_id = :walletId', { walletId })
      .andWhere('(received_sticker_id IS NULL OR received_sticker_name IS NULL)')
      .execute();
  }

  /**
   * Anula todas las FK que apunten a este registro de billetera
   * en las tablas offers y exchanges, para evitar violaciones de
   * clave foránea al eliminarlo.
   * * @param walletId ID del registro de billetera a desreferenciar.
   */
  private async nullifyWalletRefs(walletId: number): Promise<void> {
    // Cancelar ofertas pendientes que usen esta wallet antes de nullear la FK,
    // para que no queden ofertas "zombie" sin figurita en la bolsa pública.
    await this.offerRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'rejected' as any })
      .where("offer_wallet_id = :walletId AND status = 'pending'", { walletId })
      .execute();

    await this.offerRepository
      .createQueryBuilder()
      .update()
      .set({ offer_wallet_id: null as any })
      .where("offer_wallet_id = :walletId", { walletId })
      .execute();

    await this.exchangeRepository
      .createQueryBuilder()
      .update()
      .set({ offeredWallet: null as any })
      .where("offered_wallet_id = :walletId", { walletId })
      .execute();

    await this.exchangeRepository
      .createQueryBuilder()
      .update()
      .set({ receivedWallet: null as any })
      .where("received_wallet_id = :walletId", { walletId })
      .execute();
  }

  /**
   * Decrementa el stock de una figurita en la billetera.
   * * Si el stock llega a cero (o es 1), elimina el registro de la billetera.
   * * @param id ID del registro en la billetera.
   * * @param userId ID del usuario propietario.
   * * @throws {NotFoundException} Si la figurita no pertenece al usuario o no existe.
   */
  async decrementStock(id: number, userId: number): Promise<void> {
    const walletItem = await this.stickersWalletRepository.findOne({
      where: {
        id,
        user: { id: userId },
      },
      relations: {
        sticker: true,
        user: true,
      },
    });

    if (!walletItem) {
      throw new NotFoundException("Figurita no encontrada en tu billetera");
    }

    if (walletItem.stock > 1) {
      walletItem.stock -= 1;
      await this.stickersWalletRepository.save(walletItem);
      return;
    }

    await this.checkActiveOffer(id);
    await this.preserveOfferStickerSnapshot(id);
    await this.nullifyWalletRefs(id);
    await this.stickersWalletRepository.delete(id);
  }

  /**
   * Elimina un registro de la billetera.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.checkActiveOffer(id);
    await this.preserveOfferStickerSnapshot(id);
    await this.nullifyWalletRefs(id);
    await this.stickersWalletRepository.delete(id);
  }
}