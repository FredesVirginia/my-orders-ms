import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderController,  } from './orders.controller';
import { OrderService, } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])], 
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
