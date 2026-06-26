import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateStickersWalletDto } from "./../dto/create-stickers-wallet.dto";
import { UpdateStickersWalletDto } from "./../dto/update-stickers-wallet.dto";
import { StickersWallet } from "./../entities/stickers-wallet.entity";

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
  ) {}

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
  findAll(): Promise<StickersWallet[]> {
    return this.stickersWalletRepository.find({
      relations: { sticker: true },
    });
  }

  /**
   * Obtiene todas las figuritas pertenecientes a un usuario específico.
   * * @param userId ID del usuario.
   */
  findByUser(userId: number): Promise<StickersWallet[]> {
    return this.stickersWalletRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        sticker: true,
      },
    });
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

    return wallet;
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

    await this.stickersWalletRepository.delete(id);
  }

  /**
   * Elimina un registro de la billetera.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.stickersWalletRepository.delete(id);
  }
}
