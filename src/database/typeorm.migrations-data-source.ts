import { Injectable } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({
  path: join(__dirname, `../../.${process.env.NODE_ENV || 'development'}.env`),
});

@Injectable()
export class MigrationDataSourceConfigService {
  public createOptions(): DataSourceOptions {
    return {
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      host: process.env.DATABASE_HOST,
      logging: true,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      synchronize: false,
      type: process.env.DB_TYPE,
      username: process.env.DATABASE_USER,
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsTableName: 'typeorm_migrations',
      cli: {
        migrationsDir: `/migrations`,
      },
    } as DataSourceOptions;
  }
}

const dataSourceConfigService = new MigrationDataSourceConfigService();

const dataSource = new DataSource(dataSourceConfigService.createOptions());

export default dataSource;
