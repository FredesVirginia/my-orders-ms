import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { Order } from './entity/order.entity';

import { RpcException } from '@nestjs/microservices';
import { OrderDto } from './dto/Order-created.dto';
import { OrderItem } from './entity/orderItem.entity';
import { groupBy } from 'rxjs';
import { CardItem } from './entity/cardItem.entity';
import { AddToCartDto, UpdateCartDto } from './dto/AddToCartItem.dto';
import { Coupon } from 'src/coupon/entity/coupon.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CardItem)
    private readonly cartItemRepository: Repository<CardItem>,
    private readonly dataSource: DataSource,
  ) {}

  // async createOrder(orderDto: OrderDto, couponId?: Coupon) {
  //   try {
  //     if (couponId) {
  //       console.log('POR AQUI', couponId);
  //       const coupon = couponId[0];
  //       const descuento = couponId.discountPercent;
  //       const order = new Order();
  //       order.userId = orderDto.userId;
  //       order.items = orderDto.items.map((item) => {
  //         const orderItem = new OrderItem();
  //         orderItem.productId = item.productId;
  //         orderItem.quantity = item.quantity;
  //         orderItem.price = item.price;
  //         return orderItem;
  //       });

  //       const total = order.items.reduce(
  //         (sum, item) => sum + parseInt(item.price) * item.quantity,
  //         0,
  //       );

  //       const discount = (total * descuento!) / 100;
  //       const totalWithDiscount = total - discount;
  //       order.subTotal = total.toString();
  //       order.total = totalWithDiscount.toString();
  //       order.coupon = coupon;

  //       return this.orderRepository.save(order);
  //     } else {
  //       const order = new Order();
  //       order.userId = orderDto.userId;
  //       order.items = orderDto.items.map((item) => {
  //         const orderItem = new OrderItem();
  //         orderItem.productId = item.productId;
  //         orderItem.quantity = item.quantity;
  //         orderItem.price = item.price;
  //         return orderItem;
  //       });

  //       const total = order.items.reduce(
  //         (sum, item) => sum + parseInt(item.price) * item.quantity,
  //         0,
  //       );
  //       order.total = total.toString();
  //       return this.orderRepository.save(order);
  //     }
  //   } catch (error) {
  //     console.log('EEROR FUE ', error);

  //     throw new InternalServerErrorException('Error interno del servidor');
  //   }
  // }



  async createOrder(orderDto: OrderDto, couponId?: Coupon) {
  try {
    const order = new Order();
    order.userId = orderDto.userId;
    order.items = orderDto.items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.productId = item.productId;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      return orderItem;
    });

    const total = order.items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );

    order.subTotal = total.toString();

    if (couponId) {
      // Si couponId es un array, extraemos el primer elemento
      const coupon = Array.isArray(couponId) ? couponId[0] : couponId;
      const descuento = parseFloat(coupon.discountPercent);

      const discount = (total * descuento) / 100;
      const totalWithDiscount = total - discount;
      console.log("TOTAL WITH DIOSS" , totalWithDiscount)
      order.total = totalWithDiscount.toString();
      order.coupon = coupon;
    } else {
      console.log("TOTAL" , total)
      order.total = total.toString();
    }

    return this.orderRepository.save(order);
  } catch (error) {
    console.error('ERROR:', error);
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

  async addCart(userId: string, dto: AddToCartDto): Promise<CardItem> {
    const { productId, quantity } = dto;
    const existingItem = await this.cartItemRepository.findOne({
      where: { userId, productId },
    });
    if (existingItem) {
      //SI YA EXISTE , ACTUALIZAMOS LA CANTIDAD
      existingItem.quantity += quantity;
      return this.cartItemRepository.save(existingItem);
    }

    //SI NO EXISTE , CREMOS UNO NUEVO

    const newItem = this.cartItemRepository.create({
      userId,
      productId,
      quantity,
    });

    return this.cartItemRepository.save(newItem);
  }

  async deleteCart(userId: string, dto: UpdateCartDto) {
    const { productId, quantity } = dto;
    const existingItem = await this.cartItemRepository.findOne({
      where: { userId, productId },
    });

    if (!existingItem) {
      console.log(`EL usuario no tiene el product ${productId}`);
      throw new RpcException({
        message: `EL usuario no tiene el product ${productId}`,
      });
    }

    const result = await this.cartItemRepository.remove(existingItem);
    return {
      message: 'Producto eliminado',
      result: result,
    };
  }

  async getCartUserItem(userId: string) {
    try {
      const result = await this.cartItemRepository.find({
        where: { userId },
      });

      if (result.length > 0) {
        return result;
      }

      return [];
    } catch (error) {
      console.log('El Erroe fue', error);
      throw new RpcException({
        message: error,
      });
    }
  }

  async deleteCartAfterOrderPost(userId: any) {
    const user = userId.user;
    try {
      const result = await this.cartItemRepository.find({
        where: { userId: user },
      });

      if (result.length == 0) {
        console.log(`EL usuario no tiene el product ${userId}`);
        throw new RpcException({
          message: `EL usuario no tiene el product ${userId}`,
        });
      }

      const resultDelete = await this.cartItemRepository.remove(result);

      return resultDelete;
    } catch (error) {
      console.log('El Erroe fue', error);
      throw new RpcException({
        message: error,
      });
    }
  }

  async getAllOrdersByUser(userId: string) {
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

      console.log('EL RESULT ES ', result);

      if (result.length > 0) {
        return {
          userIdsssssssssssssss: userId,
          data: result,
        };
      } else {
        return {
          MESSAGE: 'Ño hay Compras',
        };
      }
    } catch (error) {
      throw new RpcException({
        error,
      });
    }
  }

  async getAllTotalOrderByUser(userId: string) {
    try {
      const result1 = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'totalCompras')
        .addSelect('COUNT(order.id)', 'cantidadCompras')
        .where('order.userId = :userId', { userId })
        .getRawOne();

      const result2 = await this.orderItemRepository
        .createQueryBuilder('orderItem')
        .innerJoin('orderItem.order', 'order')
        .select('DISTINCT orderItem.productId', 'productId')
        .where('order.userId = :userId', { userId })
        .getRawMany();

      const result3 = await this.orderItemRepository
        .createQueryBuilder('orderItem')
        .innerJoin('orderItem.order', 'order')
        .select('orderItem.productId', 'productId')
        .addSelect('SUM(orderItem.quantity)', 'total')
        .where('order.userId = :userId', { userId })
        .groupBy('orderItem.productId')
        .orderBy('total', 'DESC')
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
        productos: result2.map((p) => p.productId),
        productoMasComprado: result3 ? result3.productId : null,
      };
    } catch (error) {
      console.log('El erroe fue ', error);

      if (error instanceof RpcException) throw error;

      throw new RpcException({
        status: 500,
        message: 'Error interno al obtener el total de órdenes',
        details: error.message || error,
      });
    }
  }

  async getProductForMountAverageByUser(userId: string) {
    try {
      const result = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.items', 'items')
        .select(`TO_CHAR(order.createdAt, 'YYYY-MM')`, 'mes')
        .addSelect('COUNT(DISTINCT items.productId)', 'cantidadProductos')
        .addSelect('ROUND(AVG(items.quantity), 2)', 'promedio')
        .where('order.userId = :userId', { userId })
        .groupBy('mes')
        .getRawMany();

      return result;
    } catch (error) {
      console.log('El error fue', error);
      throw new RpcException({
        message: error,
      });
    }
  }

  async getUser200mouth(userId: string) {
    try {
      const result = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'totalPorMesGastado')
        .addSelect(`TO_CHAR(order.createdAt, 'YYYY-MM')`, 'mes')
        .where('order.userId = :userId', { userId })
        .groupBy(`TO_CHAR(order.createdAt, 'YYYY-MM')`)
        .having('SUM(order.total) > 200')
        .getRawMany();

      if (result.length === 0) {
        return {
          message: `El usuarion con id ${userId} no tienes meses con gasto mayor a 200 pesos`,
        };
      }

      return result;
    } catch (error) {
      console.log('El error fue');
      throw new RpcException({
        message: error,
      });
    }
  }

  async getMouthFromUser200(mes: string) {
    try {
      const result = await this.orderRepository
        .createQueryBuilder('order')
        .select('order.userId', 'usuarios')
        .addSelect('SUM(order.total)', 'total')
        .where(`TO_CHAR(order.createdAt, 'YYYY-MM') = :mes`, { mes })
        .groupBy('order.userId')
        .having('SUM(order.total) > 200')
        .getRawMany();

      if (result.length === 0) {
        return {
          message: `No hay usuarios que hallan gastado un total mayor a 200 en el mes ${mes}`,
        };
      }

      return result;
    } catch (error) {
      console.log('El error fue ', error);
      throw new RpcException({
        message: error,
      });
    }
  }

  async getHistoryUser(userId: string) {
    try {
      const result = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'totalComprado')
        .addSelect('COUNT(order.id)', 'cantidadDeOrdenes')
        .where('order.userId = :userId', { userId })
        .getRawOne();

      const orders = await this.orderRepository.find({
        where: { userId },
      });

      const ordersAndOrderItem = await this.orderItemRepository
        .createQueryBuilder('itemsOrder')
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

      const groupedByOrderId = ordersAndOrderItem.reduce(
        (acc, item) => {
          const orderId = item.orderId;

          if (!acc[orderId]) {
            acc[orderId] = {
              orderId,
              total: item.ord_total,
              items: [],
            };
          }

          acc[orderId].items.push({
            quantity: item.itemsOrder_quantity,
            productId: item.itemsOrder_productId,
            price: item.itemsOrder_price,
            updatedAt: item.itemsOrder_updatedAt,
          });

          return acc;
        },
        {} as Record<
          string,
          {
            orderId: string;
            total: string;
            items: Array<{
              quantity: number;
              productId: string;
              price: string;
              updatedAt: string;
            }>;
          }
        >,
      );

      // Si quieres un array en lugar de un objeto con keys:
      const groupedArray = Object.values(groupedByOrderId);

      return {
        result,
        groupedArray,
      };
    } catch (error) {
      console.log('El error fue ', error);

      if (error instanceof RpcException) throw error;

      throw new RpcException({
        status: 500,
        message: 'Error interno al obtener el total de órdenes',
        details: error.message || error,
      });
    }
  }

  async getProductsMouthBestSellers() {
    try {
      const result = await this.dataSource.query(`
    WITH ventas_por_producto AS (
  SELECT
    TO_CHAR(o."createdAt", 'YYYY-MM') AS mes,
    oi."productId",
    SUM(oi.quantity) AS total_vendido,
    ROW_NUMBER() OVER (
      PARTITION BY TO_CHAR(o."createdAt", 'YYYY-MM')
      ORDER BY SUM(oi.quantity) DESC
    ) AS fila
  FROM "order" o
  JOIN order_item oi ON o.id = oi."orderId"
  GROUP BY mes, oi."productId"
)
SELECT
  mes,
  "productId",
  total_vendido
FROM ventas_por_producto
WHERE fila = 1;

  `);

      return result;
    } catch (error) {
      console.log('El error fue', error);
      throw new RpcException({
        message: error,
      });
    }
  }

  async getIdTodoList(id: string) {
    const todoListId = await this.orderRepository.findOneBy({ id });
    if (!todoListId) {
      throw new NotFoundException('Tarea no encontrada');
    }
    return {
      status: HttpStatus.ACCEPTED,
      data: todoListId,
    };
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
