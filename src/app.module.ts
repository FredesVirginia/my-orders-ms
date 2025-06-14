import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from './orders/config';
import { OrderModule } from './orders/orders.module';
import { Order } from './orders/entity/order.entity';
import { OrderItem } from './orders/entity/orderItem.entity';
import { Payment } from './orders/entity/payment.entity';
import { Shipment } from './orders/entity/shipped.entity';

import { CardItem } from './orders/entity/cardItem.entity';
import { CouponModule } from './coupon/coupon.module';
import { Coupon } from './coupon/entity/coupon.entity';


@Module({
  imports: [
    OrderModule,
    CouponModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbHost,
      port: envs.port,
      username: envs.dbUser,
      password: envs.dbPassword,
      database: envs.dbName,
      entities: [Order , OrderItem , Payment , Shipment , CardItem , Coupon],
      synchronize: true,
    }),

   
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Servicio adicional para verificar la conexión
    {
      provide: 'DATABASE_CONNECTION_LOGGER',
      useFactory: async () => {
        const logger = new Logger('Database');

        setTimeout(() => {
          logger.log(
            `🗄️  Conectado a PostgreSQL en: ${envs.dbHost}:${envs.port}/${envs.dbName}`,
          );
          logger.debug('✅ ¡Conexión exitosa!');
        }, 1000);
      },
    },
  ],
})
export class AppModule {}
