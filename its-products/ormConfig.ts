// productos-ms/ormconfig.ts
import { DataSourceOptions } from 'typeorm';
import { Product } from './src/entities/product.entity';
import { envs } from './src/config/envs';

const config: DataSourceOptions = {
  type: 'mysql',
  host: envs.db.host,
  port: envs.db.port,
  username: envs.db.username,
  password: envs.db.password,
  database: envs.db.database,
  entities: [Product],
  synchronize: true, // Para producción usar migraciones
};

export default config;
