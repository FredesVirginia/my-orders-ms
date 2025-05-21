import { Body, Controller, Delete, Get, Param,  ParseUUIDPipe, Post } from '@nestjs/common';


import { Payload } from '@nestjs/microservices';

import { OrderUserDto } from './dto/Order-created.dto';
import { OrderService } from './orders.service';

@Controller('orders')
export class OrderController {
    constructor (private readonly orderService : OrderService){}


    @Post()
    async createOrder(@Body() orderDto : OrderUserDto){
        const newTodoList = await this.orderService.createOrder(orderDto)
        return newTodoList
    }

    @Get()
    async getAllOrders(){
        return await this.orderService.getAllOrder()
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
