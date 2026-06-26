import 'dotenv/config';
import * as fs from 'fs';
import { DataSource } from 'typeorm';

/**
 * Configuración de la fuente de datos (DataSource) de TypeORM.
 * Adaptada para funcionar tanto en desarrollo (TypeScript) como en producción (JavaScript).
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [process.env.NODE_ENV === 'production' 
    ? 'dist/**/*.entity.js' 
    : 'src/**/*.entity.ts'],
  
  migrations: [process.env.NODE_ENV === 'production' 
    ? 'dist/migrations/*.js' 
    : 'src/migrations/*.ts'],

  synchronize: false,
  logging: process.env.NODE_ENV !== 'production', 
  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL_CA_PATH!).toString(),
    rejectUnauthorized: true,
  },
});