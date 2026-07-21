import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, In } from "typeorm";

import { CreateSpinsWalletDto } from "./../dto/create-spins-wallet.dto";
import { UpdateSpinsWalletDto } from "./../dto/update-spins-wallet.dto";
import { SpinsWallet } from "./../entities/spins-wallet.entity";
import { PacksWallet } from "./../entities/packs-wallet.entity";
import { Prize } from "../../prize/entities/prize.entity";
import { Pack } from "../../packs/entities/pack.entity";
import { PacksWalletService } from "./packs-wallet.service";

@Injectable()
export class SpinsWalletService {
  constructor(
    @InjectRepository(SpinsWallet)
    private readonly spinsWalletRepository: Repository<SpinsWallet>,

    private readonly dataSource: DataSource,

    private readonly packsWalletService: PacksWalletService,
  ) {}

  async executeSecureSpin(userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(SpinsWallet, {
        where: {
          user_id: userId,
        },
      });

      if (!wallet) {
        throw new NotFoundException(
          `Billetera de giros no encontrada para el usuario #${userId}`,
        );
      }

      const stockActual = Number(wallet.stock);

      if (stockActual <= 0) {
        throw new BadRequestException(
          "No posees suficientes giros disponibles",
        );
      }


      const allPrizes = await queryRunner.manager.find(Prize);

      if (!allPrizes.length) {
        throw new NotFoundException(
          "No hay premios configurados en la ruleta.",
        );
      }


      const indexWheel = Math.floor(
        Math.random() * allPrizes.length,
      );


      const prizeObtained = allPrizes[indexWheel];


      wallet.stock = stockActual - 1;


      await queryRunner.manager.save(
        SpinsWallet,
        wallet,
      );


      const packsAcreditados = [
        prizeObtained.id_packs_bronce,
        prizeObtained.id_packs_plateado,
        prizeObtained.id_packs_dorado,
      ].filter((packId): packId is number => Boolean(packId));

      if (packsAcreditados.length > 0) {
        const uniquePackIds = Array.from(new Set(packsAcreditados));

        // 1 sola consulta para validar que todos los packs existen
        // (antes era 1 findOne por pack, en serie).
        const existingPacks = await queryRunner.manager.find(Pack, {
          where: { id: In(uniquePackIds) },
        });

        const existingPackIds = new Set(existingPacks.map((pack) => pack.id));

        for (const packId of uniquePackIds) {
          if (!existingPackIds.has(packId)) {
            throw new NotFoundException(`El pack ${packId} no existe`);
          }
        }

        // 1 sola consulta para traer de una todas las billeteras de pack
        // que el usuario ya tenga (antes era 1 findOne por pack, en serie).
        const existingWalletItems = await queryRunner.manager.find(
          PacksWallet,
          {
            where: {
              user_id: userId,
              pack_id: In(uniquePackIds),
            },
          },
        );

        const walletByPackId = new Map(
          existingWalletItems.map((item) => [item.pack_id, item]),
        );

        const walletItemsToSave: PacksWallet[] = [];

        for (const packId of packsAcreditados) {
          const existing = walletByPackId.get(packId);

          if (existing) {
            existing.stock = Number(existing.stock) + 1;
            walletItemsToSave.push(existing);
          } else {
            const created = queryRunner.manager.create(PacksWallet, {
              user_id: userId,
              pack_id: packId,
              stock: 1,
            });

            walletByPackId.set(packId, created);
            walletItemsToSave.push(created);
          }
        }

        await queryRunner.manager.save(PacksWallet, walletItemsToSave);
      }


      await queryRunner.commitTransaction();


      return {
        success: true,
        prize: prizeObtained,
        index_wheel: indexWheel,
        spins_remaining: Number(wallet.stock),
      };


    } catch (error) {

      await queryRunner.rollbackTransaction();

      throw error;

    } finally {

      await queryRunner.release();

    }
  }


  create(
    createSpinsWalletDto: CreateSpinsWalletDto,
  ): Promise<SpinsWallet> {

    const wallet =
      this.spinsWalletRepository.create(
        createSpinsWalletDto,
      );

    return this.spinsWalletRepository.save(wallet);
  }


  findAll(): Promise<SpinsWallet[]> {

    return this.spinsWalletRepository.find();

  }


  async findOne(id: number): Promise<SpinsWallet> {

    const wallet =
      await this.spinsWalletRepository.findOne({
        where: {
          id,
        },
      });


    if (!wallet) {
      throw new NotFoundException(
        `SpinsWallet #${id} not found`,
      );
    }


    return wallet;
  }


  /**
   * Obtiene la billetera de giros de un usuario por su user_id.
   */
  async findByUser(userId: number): Promise<SpinsWallet> {

    const wallet =
      await this.spinsWalletRepository.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!wallet) {
      throw new NotFoundException(
        `SpinsWallet #${userId} not found`,
      );
    }

    return wallet;
  }


  async update(
    id: number,
    updateSpinsWalletDto: UpdateSpinsWalletDto,
  ): Promise<SpinsWallet> {

    await this.findOne(id);


    await this.spinsWalletRepository.update(
      id,
      updateSpinsWalletDto,
    );


    return this.findOne(id);
  }


  async remove(id: number): Promise<void> {

    await this.findOne(id);

    await this.spinsWalletRepository.delete(id);

  }


  async addSpinsToUser(
    userId: number,
    spinsToAdd: number,
  ): Promise<SpinsWallet> {


    let wallet =
      await this.spinsWalletRepository.findOne({
        where: {
          user_id: userId,
        },
      });


    if (!wallet) {

      wallet =
        this.spinsWalletRepository.create({
          user_id: userId,
          stock: spinsToAdd,
        });


    } else {

      wallet.stock =
        Number(wallet.stock) +
        Number(spinsToAdd);

    }


    return this.spinsWalletRepository.save(wallet);
  }
}