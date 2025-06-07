import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderController,  } from './orders.controller';
import { OrderService, } from './orders.service';
import { OrderItem } from './entity/orderItem.entity';
import { CardItem } from './entity/cardItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order , OrderItem , CardItem])], 
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
