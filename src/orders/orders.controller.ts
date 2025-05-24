import { Body, Controller, Delete, Get, Param,  ParseUUIDPipe, Post } from '@nestjs/common';


import { MessagePattern, Payload } from '@nestjs/microservices';

import { OrderDto } from './dto/Order-created.dto';
import { OrderService } from './orders.service';

@Controller('orders')
export class OrderController {
    constructor (private readonly orderService : OrderService){}

    @MessagePattern('create-order')
    @Post()
    async createOrder(@Body() orderDto : OrderDto){
        const newTodoList = await this.orderService.createOrder(orderDto)
        return newTodoList
    }

    // @Get()
    // async getAllOrders(){
    //     return await this.orderService.getAllOrder()
    // }


    @MessagePattern('order-by-user')
 
    async getAllOrdersByUser( @Payload() userId: string){
        return this.orderService.getAllOrdersByUser(userId);
    }

    @Get(':id')
    async getTodoListId(@Param('id' , new ParseUUIDPipe()) id: string){
        return this.orderService.getIdTodoList(id)
    }


    @Delete(':id')
    async deleteTodoList(@Param('id' , new ParseUUIDPipe()) id:string){
        return this.orderService.deleteTodoList(id)
    }

   
}
