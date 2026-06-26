import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";

import { CreateSpinsWalletDto } from "./../dto/create-spins-wallet.dto";
import { UpdateSpinsWalletDto } from "./../dto/update-spins-wallet.dto";
import { SpinsWallet } from "./../entities/spins-wallet.entity";
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
      ];


      for (const packId of packsAcreditados) {

        if (!packId) {
          continue;
        }


        const packExists =
          await queryRunner.manager.findOne(Pack, {
            where: {
              id: packId,
            },
          });


        if (!packExists) {
          throw new NotFoundException(
            `El pack ${packId} no existe`,
          );
        }


        await this.packsWalletService.creditPack(
          userId,
          packId,
          1,
          queryRunner.manager,
        );
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
