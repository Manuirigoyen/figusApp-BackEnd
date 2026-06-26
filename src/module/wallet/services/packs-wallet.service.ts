import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { CreatePacksWalletDto } from "./../dto/create-packs-wallet.dto";
import { UpdatePacksWalletDto } from "./../dto/update-packs-wallet.dto";
import { PacksWallet } from "./../entities/packs-wallet.entity";

@Injectable()
export class PacksWalletService {
  constructor(
    @InjectRepository(PacksWallet)
    private readonly packsWalletRepository: Repository<PacksWallet>,
  ) {}

  async creditPack(
    userId: number,
    packId: number,
    quantity: number = 1,
    transactionalManager?: EntityManager,
  ): Promise<void> {
    const manager = transactionalManager || this.packsWalletRepository.manager;

    const walletItem = await manager.findOne(PacksWallet, {
      where: {
        user_id: userId,
        pack_id: packId,
      },
    });

    if (walletItem) {
      walletItem.stock = Number(walletItem.stock) + Number(quantity);
      await manager.save(PacksWallet, walletItem);
    } else {
      const newWalletItem = manager.create(PacksWallet, {
        user_id: userId,
        pack_id: packId,
        stock: quantity,
      });
      await manager.save(PacksWallet, newWalletItem);
    }
  }

  create(createPacksWalletDto: CreatePacksWalletDto): Promise<PacksWallet> {
    const wallet = this.packsWalletRepository.create(createPacksWalletDto);
    return this.packsWalletRepository.save(wallet);
  }

  findAll(): Promise<PacksWallet[]> {
    return this.packsWalletRepository.find({ relations: { pack: true } });
  }

  async findOne(id: number): Promise<PacksWallet> {
    const wallet = await this.packsWalletRepository.findOne({
      where: { id },
      relations: { pack: true },
    });

    if (!wallet) {
      throw new NotFoundException(`PacksWallet with ID ${id} not found`);
    }

    return wallet;
  }

  async update(
    id: number,
    updatePacksWalletDto: UpdatePacksWalletDto,
  ): Promise<PacksWallet> {
    await this.findOne(id);
    await this.packsWalletRepository.update(id, updatePacksWalletDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.packsWalletRepository.delete(id);
  }
}
