import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {Order} from "./entity/order.entity"
import { ILike, Repository } from 'typeorm';

import { RpcException } from '@nestjs/microservices';
import { OrderDto } from './dto/Order-created.dto';
import { OrderItem } from './entity/orderItem.entity';


@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createOrder(orderDto: OrderDto) {
    try {
      const order = new Order();
      order.userId = orderDto.userId;
      order.items = orderDto.items.map((item)=>{
        const orderItem = new OrderItem();
        orderItem.productId = item.productId;
        orderItem.quantity = item.quantity;
        orderItem.price = item.price;
        return orderItem;
      })

      const total = order.items.reduce((sum, item) => sum + parseInt(item.price) * item.quantity, 0);
      order.total = total.toString()
  return this.orderRepository.save(order);
    } catch (error) {
      console.log('EEROR FUE ', error);

     

      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  async getAllOrder() {
    try {
      const allUser = await this.orderRepository.find();
      return allUser;
    } catch (error) {
      throw new RpcException({
        HttpStatus: HttpStatus.BAD_REQUEST,
      });
    }
  }

  async getAllOrdersByUser(id : string){
      console.log('ID recibido en microservicio:', id); // <- Agrega esto
      try {
         const allOrderByUser = await this.orderRepository.find({
            where: { userId: id },
            relations: ['items'], 
          });

        if (allOrderByUser.length > 0) {
            return {
              userIdsssssssssssssss: id,
              data: allOrderByUser,
            };
          }

        return {
          userId: id,
          message: "El usuario no ha realizado compras todavía",
          data: [],
        };
      }catch(error){
        throw new RpcException({
          error
        })
      }


  }

  async getIdTodoList(id:string){
    const todoListId = await this.orderRepository.findOneBy({id})
    if(!todoListId){
      throw new NotFoundException("Tarea no encontrada")
    }
    return {
      status : HttpStatus.ACCEPTED,
      data : todoListId
    }
  }

  async deleteTodoList(id: string) {
    const todoList = await this.orderRepository.findOneBy({ id });
    if (!todoList) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const data = await this.orderRepository.remove(todoList);
    return {
      status: HttpStatus.ACCEPTED,
      data,
    };
  }


  // async lookForTodoListByKeyWord( word : string){
  //   const todoList = await this.todoListRepository.find({
  //     where : [
  //       {title : ILike(`%${word}%`)},
  //       {description : ILike(`%${word}%`)},
  //       {content : ILike(`%${word}%`)}
  //     ]
  //   })

  //    if(!todoList){
  //     throw new NotFoundException(`No se encontraron tareas con la palabra clave ${word}`)
  //    }

  //    return todoList
  // }
}
