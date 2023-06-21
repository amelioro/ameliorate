import { PluralSnakeCaseNamingStrategy } from './pluralSnake.namingStrategy';
import { DataSource, DataSourceOptions } from 'typeorm';

// wtf `npm run start` requires dist/.js, but `npm run migrate` requires src/.ts
// seems like nest should be able to use ts files and know to compile them?
export const jsDbConfig: DataSourceOptions = {
  type: 'postgres',
  url: 'postgres://postgres:Demo99!@localhost:33100/ameliorate',
  entities: ['./dist/**/*entity.js'],
  logging: true,
  namingStrategy: new PluralSnakeCaseNamingStrategy(),
  migrations: ['./dist/db/migration/*.js'],
};

export const tsDbConfig: DataSourceOptions = {
  type: 'postgres',
  url: 'postgres://postgres:Demo99!@localhost:33100/ameliorate',
  entities: ['./src/**/*entity.ts'],
  logging: true,
  namingStrategy: new PluralSnakeCaseNamingStrategy(),
  migrations: ['./src/db/migration/*.ts'],
};

export const datasource = new DataSource(tsDbConfig);
