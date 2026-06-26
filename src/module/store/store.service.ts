import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";

import { Store, ProductType } from "./entities/store.entity";
import { CreateStoreDto } from "./dto/create-store.dto";
import { UpdateStoreDto } from "./dto/update-store.dto";
import { PacksWalletService } from "../wallet/services/packs-wallet.service";

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly dataSource: DataSource,
    private readonly packsWalletService: PacksWalletService,
  ) { }

  async purchaseProduct(
    userId: number,
    storeId: number,
    quantity: number,
  ): Promise<void> {
    const product = await this.findOne(storeId);
    if (product.stock_available < quantity) {
      throw new InternalServerErrorException(
        `Stock insuficiente para el producto #${storeId}`,
      );
    }

    const price = Number(product.price_usd);
    const discount = Number(product.discount_active);
    const totalUsd = (price - discount) * quantity;

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      try {
        await transactionalEntityManager.query(
          `INSERT INTO "purchases" ("user_id", "store_id", "quantity", "total_usd", "discount_usd") 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            storeId,
            quantity,
            this.normalizeDecimal(totalUsd),
            this.normalizeDecimal(discount * quantity),
          ],
        );

        await transactionalEntityManager.query(
          `UPDATE "store" SET "stock_available" = "stock_available" - $1 WHERE "id" = $2`,
          [quantity, storeId],
        );

        if (product.product_type === ProductType.PACK && product.pack_id) {
          for (let i = 0; i < quantity; i++) {
            await this.packsWalletService.creditPack(
              userId,
              product.pack_id,
              1,
              transactionalEntityManager,
            );
          }
        } else if (product.product_type === ProductType.COMBO) {
          for (const item of product.comboItems) {
            const totalItemQuantity = item.quantity * quantity;

            if (item.pack_id) {
              for (let i = 0; i < totalItemQuantity; i++) {
                await this.packsWalletService.creditPack(
                  userId,
                  item.pack_id,
                  1,
                  transactionalEntityManager,
                );
              }
            }

            if (item.spin_quantity > 0) {
              await transactionalEntityManager.query(
                `INSERT INTO "spins_wallet" ("user_id", "stock") 
                 VALUES ($1, $2) 
                 ON CONFLICT ("user_id") 
                 DO UPDATE SET "stock" = "spins_wallet"."stock" + EXCLUDED."stock"`,
                [userId, item.spin_quantity * quantity],
              );
            }
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        throw new InternalServerErrorException(
          `Fallo en la transacción de compra: ${errorMessage}`,
        );
      }
    });
  }

  private normalizeDecimal(value?: number, fallback = "0.00"): string {
    if (value === undefined || value === null) {
      return fallback;
    }
    return Number(value).toFixed(2);
  }

  async create(dto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepository.create({
      pack_id: dto.pack_id,
      name: dto.name,
      description: dto.description,
      price_usd: this.normalizeDecimal(dto.price_usd),
      discount_usd: this.normalizeDecimal(dto.discount_usd),
      discount_active: this.normalizeDecimal(dto.discount_active),
      stock_available: dto.stock_available ?? 0,
      cover_image: dto.cover_image,
      product_type: dto.product_type,
    });

    return await this.storeRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return await this.storeRepository.find({
      relations: ["pack", "comboItems", "comboItems.pack"],
    });
  }

  async findByProductType(productType: ProductType): Promise<Store[]> {
    return await this.storeRepository.find({
      where: { product_type: productType },
      relations: ["pack", "comboItems", "comboItems.pack"],
    });
  }

  async findWithDiscount(): Promise<Store[]> {
    return await this.storeRepository
      .createQueryBuilder("store")
      .leftJoinAndSelect("store.pack", "pack")
      .leftJoinAndSelect("store.comboItems", "comboItems")
      .leftJoinAndSelect("comboItems.pack", "comboItemPack")
      .where("CAST(store.discount_active AS DECIMAL(10,2)) > 0")
      .getMany();
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Store[]> {
    return await this.storeRepository
      .createQueryBuilder("store")
      .leftJoinAndSelect("store.pack", "pack")
      .leftJoinAndSelect("store.comboItems", "comboItems")
      .leftJoinAndSelect("comboItems.pack", "comboItemPack")
      .where("CAST(store.price_usd AS DECIMAL(10,2)) >= :minPrice", {
        minPrice,
      })
      .andWhere("CAST(store.price_usd AS DECIMAL(10,2)) <= :maxPrice", {
        maxPrice,
      })
      .getMany();
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ["pack", "comboItems", "comboItems.pack"],
    });

    if (!store) {
      throw new NotFoundException(`Product #${id} not found in store`);
    }

    return store;
  }

  async update(id: number, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    Object.assign(store, {
      ...dto,
      price_usd:
        dto.price_usd !== undefined
          ? this.normalizeDecimal(dto.price_usd)
          : store.price_usd,
      discount_usd:
        dto.discount_usd !== undefined
          ? this.normalizeDecimal(dto.discount_usd)
          : store.discount_usd,
      discount_active:
        dto.discount_active !== undefined
          ? this.normalizeDecimal(dto.discount_active)
          : store.discount_active,
    });

    return await this.storeRepository.save(store);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.storeRepository.delete(id);
  }
}
