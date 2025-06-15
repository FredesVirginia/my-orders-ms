import { DataSource } from 'typeorm';


import * as dotenv from 'dotenv';
import { Order } from './orders/entity/order.entity';
import { Coupon } from './coupon/entity/coupon.entity';
import { OrderItem } from './orders/entity/orderItem.entity';
import { Shipment } from './orders/entity/shipped.entity';
import { Payment } from './orders/entity/payment.entity';

dotenv.config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [Order, Coupon, OrderItem , Shipment , Payment],
  migrations: ['src/migration/*.ts'],
  synchronize: false,
});
