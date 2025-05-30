import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Order } from "./entity/order.entity";

import { RpcException } from '@nestjs/microservices';
import { OrderDto } from './dto/Order-created.dto';
import { OrderItem } from './entity/orderItem.entity';


@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
     @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
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

  async getAllOrdersByUser(userId : string){
      console.log('ID recibido en microservicio:', userId); 
      try {
        

        const result = await this.orderItemRepository
            .createQueryBuilder('item')
            .innerJoin('item.order', 'order')
            .select('item.productId', 'productId')
            .addSelect('SUM(item.quantity)', 'total')
            .where('order.userId = :userId', { userId })
            .groupBy('item.productId')
            .orderBy('total', 'DESC')
            .getRawMany();

            console.log("EL RESULT ES " , result)

        if (result.length > 0) {
            return {
              userIdsssssssssssssss: userId,
              data: result,
            };
          }else {
            return {
              MESSAGE : "Ño hay Compras"
            }
          }

       
      }catch(error){
        throw new RpcException({
          error
        })
      }


  }


  async getAllTotalOrderByUser(userId: string) {
    try {
      const result1 = await this.orderRepository.createQueryBuilder('order')
      .select('SUM(order.total)' , 'totalCompras')
      .addSelect('COUNT(order.id)' , 'cantidadCompras')
      .where('order.userId = :userId' , {userId})   
      .getRawOne();

      const result2 = await this.orderItemRepository.createQueryBuilder('orderItem')
      .innerJoin('orderItem.order' , 'order')
      .select('DISTINCT orderItem.productId' , 'productId')
      .where('order.userId = :userId' , {userId})
      .getRawMany()

      
      const result3 = await this.orderItemRepository.createQueryBuilder('orderItem')
      .innerJoin('orderItem.order' , 'order')
      .select('orderItem.productId' , 'productId')
      .addSelect('SUM(orderItem.quantity)' , 'total')
      .where('order.userId = :userId' , {userId})
      .groupBy('orderItem.productId')
      .orderBy('total' , 'DESC')
      .limit(1)
      .getRawOne();

      if (result1 === 0) {
        throw new RpcException({
          status: 404,
          message: `No se encontraron órdenes para el usuario con ID ${userId}`,
        });
      }
      return {
        totalCompras: parseFloat(result1.totalCompras) || 0,
        cantidadCompras: parseInt(result1.cantidadCompras, 10) || 0,
        productos: result2.map(p => p.productId),
        productoMasComprado: result3 ? result3.productId : null,
      };
    } catch (error) {
      console.log("El erroe fue " , error)
    
      if (error instanceof RpcException) throw error;

    
      throw new RpcException({
        status: 500,
        message: 'Error interno al obtener el total de órdenes',
        details: error.message || error,
      });
    }
  }


  async getProductForMountAverageByUser(userId : string){
   try{
      const result = await this.orderRepository.createQueryBuilder('order')
      .leftJoin('order.items' , 'items')
      .select(`TO_CHAR(order.createdAt, 'YYYY-MM')`, 'mes')
      .addSelect('COUNT(DISTINCT items.productId)' , 'cantidadProductos')
      .addSelect('ROUND(AVG(items.quantity), 2)', 'promedio')
       .where('order.userId = :userId' , {userId})   
       .groupBy('mes')
       .getRawMany()

    

       return result
      
   }catch(error){
    console.log("El error fue" , error)
    throw new RpcException({
      message: error
    })
   }
  }

  async getHistoryUser(userId : string){
    try{
      const result = await this.orderRepository.createQueryBuilder("order")
      .select('SUM(order.total)' , 'totalComprado')
      .addSelect('COUNT(order.id)' , 'cantidadDeOrdenes')
      .where('order.userId = :userId' , {userId})
      .getRawOne();

      const orders = await this.orderRepository.find({
      where: { userId },

      
  });

  const ordersAndOrderItem = await this.orderItemRepository.createQueryBuilder("itemsOrder")
    .innerJoin('itemsOrder.order', 'ord')
    .select([
      'itemsOrder.orderId',
      'ord.total',
      'itemsOrder.quantity',
      'itemsOrder.price',
      'itemsOrder.productId',
      'itemsOrder.updatedAt',
    ])
    .where('ord.userId = :userId', { userId })
    // 
    .getRawMany();


    const groupedByOrderId = ordersAndOrderItem.reduce((acc, item) => {
    const orderId = item.orderId;

    if (!acc[orderId]) {
      acc[orderId] = {
        orderId,
        total: item.ord_total,
        items: []
      };
    }

    acc[orderId].items.push({
      quantity: item.itemsOrder_quantity,
      productId: item.itemsOrder_productId,
      price: item.itemsOrder_price,
      updatedAt: item.itemsOrder_updatedAt,
    });

    return acc;
  }, {} as Record<string, {
    orderId: string,
    total: string,
    items: Array<{
      quantity: number,
      productId: string,
      price: string,
      updatedAt: string
    }>
  }>);

  // Si quieres un array en lugar de un objeto con keys:
  const groupedArray = Object.values(groupedByOrderId);


      return {
        result,
        groupedArray
      }
      
    }catch(error){
      console.log("El error fue " , error)
    
      if (error instanceof RpcException) throw error;

    
      throw new RpcException({
        status: 500,
        message: 'Error interno al obtener el total de órdenes',
        details: error.message || error,
      });
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
