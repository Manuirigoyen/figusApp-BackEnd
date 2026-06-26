import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './module/users/user.module';
import { StoreModule } from './module/store/store.module';
import { PrizesModule } from './module/prize/prize.module';
import { PurchasesModule } from './module/purchases/purchase.module';
import { OffersModule } from './module/offers/offer.module';
import { ExchangesModule } from './module/exchanges/exchanges.module';
import { AlbumsModule } from './module/albums/albums.module';
import { PacksModule } from './module/packs/packs.module';
import { StickersModule } from './module/stickers/stickers.module';
import { WalletModule } from './module/wallet/modules/wallet.module';
import { AuthModule } from './module/auth/auth.module';
import { ContactModule } from './module/contact/contact.module';

import * as fs from 'fs';
import * as path from 'path';

/**
 * Módulo raíz de la aplicación.
 * Gestiona la configuración del entorno, la conexión a la base de datos PostgreSQL 
 * y la inicialización de todos los módulos funcionales del sistema.
 */
@Module({
  imports: [
    /**
     * Configuración global de variables de entorno.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    /**
     * Conexión a base de datos PostgreSQL mediante TypeORM.
     * Lee el certificado SSL de la carpeta local /certs.
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get<string>('NODE_ENV') !== 'production',
        ssl: {
          ca: fs.readFileSync(
            path.join(process.cwd(), 'certs', 'prod-ca-2021.crt')
          ).toString(),
          rejectUnauthorized: true,
        },
      }),
    }),

    AuthModule,
    UsersModule,
    StoreModule,
    PrizesModule,
    PurchasesModule,
    OffersModule,
    ExchangesModule,
    AlbumsModule,
    PacksModule,
    StickersModule,
    WalletModule,
    ContactModule,
  ],
})
export class AppModule {}