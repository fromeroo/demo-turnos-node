import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Turno } from '../entities/Turno';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env['DB_HOST'],
  port: parseInt(process.env['DB_PORT'] as string),
  username: process.env['DB_USER'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_NAME'],
  synchronize: true,
  logging: false,
  entities: [User, Turno],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
