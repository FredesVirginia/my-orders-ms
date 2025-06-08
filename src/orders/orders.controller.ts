import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';

import { MessagePattern, Payload } from '@nestjs/microservices';

import { OrderDto } from './dto/Order-created.dto';
import { OrderService } from './orders.service';
import { AddToCartDto } from './dto/AddToCartItem.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('create-order')
  @Post()
  async createOrder(@Body() orderDto: OrderDto) {
    const newTodoList = await this.orderService.createOrder(orderDto);
    return newTodoList;
  }

  // @Get()
  // async getAllOrders(){
  //     return await this.orderService.getAllOrder()
  // }

  @MessagePattern('order-by-user')
  async getAllOrdersByUser(@Payload() userId: string) {
    return this.orderService.getAllOrdersByUser(userId);
  }

  @MessagePattern('add-cart')
  async addToCart(@Payload() payload: { user: any , data : AddToCartDto}) {
    console.log('WEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
   console.log(payload)


    return this.orderService.addCart(payload.user.userId , payload.data)
  }

  @MessagePattern('get-add-cart-user')
  async getAddToCart (@Payload() user : any){
   
    return this.orderService.getCartUserItem(user.user)
  }

  @MessagePattern('order-total-user')
  async getAllTotalOrder(@Payload() userId: string) {
    return this.orderService.getAllTotalOrderByUser(userId);
  }

  @MessagePattern('product-average-mouth-by-user')
  async getProductByUserForMouth(@Payload() userId: string) {
    return this.orderService.getProductForMountAverageByUser(userId);
  }

  @MessagePattern('mouth-user-200')
  async getMouthUser200(@Payload() mes: string) {
    return this.orderService.getMouthFromUser200(mes);
  }

  @MessagePattern('product-best-seller-for-mouth')
  async getProductsBestSellerMout() {
    return this.orderService.getProductsMouthBestSellers();
  }

  @MessagePattern('user-200-mouth')
  async getUserMouth200(@Payload() userId: string) {
    return this.orderService.getUser200mouth(userId);
  }
  @MessagePattern('history-order')
  async getHistory(@Payload() userId: string) {
    return this.orderService.getHistoryUser(userId);
  }

  @MessagePattern('get-purchased-products')
  async handleGetPurchasedProducts(@Payload() userId: string) {
    return this.orderService.getAllOrdersByUser(userId);
  }

  @Get(':id')
  async getTodoListId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.orderService.getIdTodoList(id);
  }

  @Delete(':id')
  async deleteTodoList(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.orderService.deleteTodoList(id);
  }
}
