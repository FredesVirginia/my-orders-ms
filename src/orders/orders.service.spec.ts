import { Test, TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { InternalServerErrorException } from '@nestjs/common';
import { OrderService } from './orders.service';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/orderItem.entity';
import { CardItem } from './entity/cardItem.entity';
import { RpcException } from '@nestjs/microservices';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

const mockOrderRepo = () => ({
  save: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockOrderItemRepo = () => ({
  createQueryBuilder: jest.fn(),
});

const mockCartItemRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

export const mockDataSource = () => ({
  query: jest.fn(), // 👈 necesario para .spyOn()
});


describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: ReturnType<typeof mockOrderRepo>;
  let orderItemRepo: jest.Mocked<Repository<OrderItem>>;
  let cartRepo: jest.Mocked<Repository<CardItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useFactory: mockOrderRepo },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory: mockOrderItemRepo,
        },
        { provide: getRepositoryToken(CardItem), useFactory: mockCartItemRepo },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory: mockOrderItemRepo,
        },
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    service = module.get(OrderService);
    orderRepo = module.get(getRepositoryToken(Order));
    cartRepo = module.get(getRepositoryToken(CardItem));
    orderItemRepo = module.get(getRepositoryToken(OrderItem));
  });

  describe('createOrder', () => {
    const orderDto = {
      userId: '123',
      items: [
        { productId: '1', quantity: 2, price: '10.00' },
        { productId: '2', quantity: 1, price: '20.00' },
      ],
    };

    it('debería crear una orden sin cupón', async () => {
      const savedOrder = { id: 'order123', total: '40.00' };
      orderRepo.save.mockResolvedValue(savedOrder);

      const result = await service.createOrder(orderDto);
      expect(result).toEqual(savedOrder);
      expect(orderRepo.save).toHaveBeenCalled();
    });

    it('debería aplicar descuento con cupón válido', async () => {
      const coupon = {
        discountPercent: '50',
        validFrom: new Date(Date.now() - 86400000).toISOString(),
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      };

      const savedOrder = { id: 'order456', total: '20.00' };
      orderRepo.save.mockResolvedValue(savedOrder);

      const result = await service.createOrder(orderDto, coupon as any);
      expect(orderRepo.save).toHaveBeenCalled();
    });

    it('debería lanzar RpcException si cupón es inválido (expirado)', async () => {
      const expiredCoupon = {
        discountPercent: '10',
        validFrom: new Date('2000-01-01').toISOString(),
        validUntil: new Date('2000-01-02').toISOString(),
      };

      await expect(
        service.createOrder(orderDto, expiredCoupon as any),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('getAllOrder', () => {
    it('debería devolver todas las órdenes', async () => {
      const orders = [{ id: '1' }, { id: '2' }];
      orderRepo.find.mockResolvedValue(orders);

      const result = await service.getAllOrder();
      expect(result).toEqual(orders);
    });

    it('debería lanzar RpcException si hay error en base de datos', async () => {
      orderRepo.find.mockRejectedValue(new Error('DB error'));
      await expect(service.getAllOrder()).rejects.toThrow(RpcException);
    });
  });

  describe('addCart', () => {
    it('debería actualizar cantidad si el producto ya existe', async () => {
      const userId = 'user1';
      const dto = { productId: 'prod1', quantity: 2 };
      const existingItem = { userId, productId: 'prod1', quantity: 3 };

      cartRepo.findOne.mockResolvedValue(existingItem as any);
      cartRepo.save.mockResolvedValue({ ...existingItem, quantity: 5 } as any);

      const result = await service.addCart(userId, dto);
      expect(result.quantity).toBe(5);
    });

    it('debería crear nuevo item si no existe', async () => {
      const userId = 'user1';
      const dto = { productId: 'prod2', quantity: 1 };
      const newItem = { userId, productId: 'prod2', quantity: 1 };

      cartRepo.findOne.mockResolvedValue(null);
      cartRepo.create.mockReturnValue(newItem as any);
      cartRepo.save.mockResolvedValue(newItem as any);

      const result = await service.addCart(userId, dto);
      expect(result).toEqual(newItem);
    });
  });

  describe('deleteCart', () => {
    it('debería eliminar producto si existe', async () => {
      const userId = 'user1';
      const dto = { productId: 'prod1', quantity: 1 };
      const item = { userId, productId: 'prod1', quantity: 1 };

      cartRepo.findOne.mockResolvedValue(item as any);
      cartRepo.remove.mockResolvedValue(item as any);

      const result = await service.deleteCart(userId, dto);
      expect(result).toEqual({
        message: 'Producto eliminado',
        result: item,
      });
    });

    it('debería lanzar RpcException si el producto no existe', async () => {
      const dto = { productId: 'prodX', quantity: 1 };
      cartRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteCart('user1', dto)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('getCartUserItem', () => {
    it('debería retornar productos del carrito', async () => {
      const items = [{ id: 1 }, { id: 2 }];
      cartRepo.find.mockResolvedValue(items as any);

      const result = await service.getCartUserItem('user1');
      expect(result).toEqual(items);
    });

    it('debería retornar array vacío si no hay productos', async () => {
      cartRepo.find.mockResolvedValue([]);
      const result = await service.getCartUserItem('user1');
      expect(result).toEqual([]);
    });

    it('debería lanzar RpcException si falla la BD', async () => {
      cartRepo.find.mockRejectedValue(new Error('BD rota'));
      await expect(service.getCartUserItem('user1')).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('deleteCartAfterOrderPost', () => {
    it('debería eliminar productos del carrito después de crear orden', async () => {
      const userId = { user: '123' };
      const mockItems = [{ id: '1' }, { id: '2' }];
      cartRepo.find.mockResolvedValue(mockItems as any);
      cartRepo.remove.mockResolvedValue(mockItems as any);

      const result = await service.deleteCartAfterOrderPost(userId);
      expect(result).toEqual(mockItems);
      expect(cartRepo.find).toHaveBeenCalledWith({ where: { userId: '123' } });
      expect(cartRepo.remove).toHaveBeenCalledWith(mockItems);
    });

    it('debería lanzar RpcException si no hay productos en el carrito', async () => {
      const userId = { user: '123' };
      cartRepo.find.mockResolvedValue([]);

      await expect(service.deleteCartAfterOrderPost(userId)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('getAllOrdersByUser', () => {
    let service: OrderService;
    let orderItemRepo: jest.Mocked<Repository<OrderItem>>;
    let mockQueryBuilder: any;

    beforeEach(() => {
      // Simulación del QueryBuilder
      mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      // Mock del repositorio
      orderItemRepo = {
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
      } as any;

      // Instancia del servicio con mocks
      service = new OrderService(
        null as any, // orderRepository
        orderItemRepo, // orderItemRepository
        null as any, // cartItemRepository
        null as any, // dataSource
      );
    });

    it('debería retornar productos con quantity agrupado por userId', async () => {
      const userId = '123';
      const mockResult = [
        { productId: 'prod-1', quantity: '5' },
        { productId: 'prod-2', quantity: '2' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockResult);

      const result = await service.getAllOrdersByUser(userId);

      expect(result).toEqual({
        userId: userId,
        data: mockResult,
      });
    });

    it('debería retornar mensaje si no hay compras', async () => {
      const userId = '456';
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getAllOrdersByUser(userId);

      expect(result).toEqual({
        MESSAGE: 'Ño hay Compras',
      });
    });

    it('debería lanzar RpcException si ocurre un error en base de datos', async () => {
      const userId = '789';
      const dbError = new Error('Error de base de datos');
      mockQueryBuilder.getRawMany.mockRejectedValue(dbError);

      await expect(service.getAllOrdersByUser(userId)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('getAllTotalOrderByUser', () => {
    it('debería retornar resumen de compras del usuario', async () => {
      const mockTotal = { totalCompras: '100', cantidadCompras: '3' };

      const mockProductos = [{ productId: '1' }, { productId: '2' }];

      const mockProductoMasComprado = { productId: '1' };

      // Mock para cada query
      orderRepo.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockTotal),
      })) as any;

      orderItemRepo.createQueryBuilder = jest
        .fn()
        .mockImplementationOnce(() => ({
          innerJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue(mockProductos),
        }))
        .mockImplementationOnce(() => ({
          innerJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue(mockProductoMasComprado),
        }));

      const result = await service.getAllTotalOrderByUser('123');

      expect(result).toEqual({
        totalCompras: 100,
        cantidadCompras: 3,
        productos: ['1', '2'],
        productoMasComprado: '1',
      });
    });
  });

  describe('getProductForMountAverageByUser', () => {
  it('debería retornar el promedio de productos por mes para el usuario', async () => {
    const mockData = [
      {
        mes: '2025-05',
        cantidadProductos: '3',
        promedio: '2.33',
      },
      {
        mes: '2025-06',
        cantidadProductos: '5',
        promedio: '1.75',
      },
    ];

    // Mock chain
    orderRepo.createQueryBuilder = jest.fn().mockReturnValue({
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(mockData),
    });

    const result = await service.getProductForMountAverageByUser('123');

    expect(result).toEqual(mockData);
    expect(orderRepo.createQueryBuilder).toHaveBeenCalledWith('order');
  });

  it('debería lanzar RpcException si ocurre un error', async () => {
    orderRepo.createQueryBuilder = jest.fn().mockImplementation(() => {
      throw new Error('BD rota');
    });

    await expect(
      service.getProductForMountAverageByUser('123'),
    ).rejects.toThrow(RpcException);
  });
});


describe('getUser200mouth', () => {
  it('debería retornar los meses con gasto mayor a 200', async () => {
    const mockData = [
      { totalPorMesGastado: '350', mes: '2025-05' },
      { totalPorMesGastado: '450.50', mes: '2025-06' },
    ];

    orderRepo.createQueryBuilder = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(mockData),
    });

    const result = await service.getUser200mouth('123');

    expect(result).toEqual(mockData);
    expect(orderRepo.createQueryBuilder).toHaveBeenCalledWith('order');
  });

  it('debería retornar un mensaje si no hay meses con gasto > 200', async () => {
    orderRepo.createQueryBuilder = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    });

    const result = await service.getUser200mouth('123');

    expect(result).toEqual({
      message: 'El usuarion con id 123 no tienes meses con gasto mayor a 200 pesos',
    });
  });

  it('debería lanzar RpcException si ocurre un error', async () => {
    orderRepo.createQueryBuilder = jest.fn(() => {
      throw new Error('DB rota');
    });

    await expect(service.getUser200mouth('123')).rejects.toThrow(RpcException);
  });
});

describe('getMouthFromUser200', () => {
  it('debería retornar usuarios que gastaron más de 200 en el mes', async () => {
    const mockData = [
      { usuarios: 'user1', total: '350.00' },
      { usuarios: 'user2', total: '420.75' },
    ];

    orderRepo.createQueryBuilder = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(mockData),
    });

    const result = await service.getMouthFromUser200('2025-06');

    expect(result).toEqual(mockData);
    expect(orderRepo.createQueryBuilder).toHaveBeenCalledWith('order');
  });

  it('debería retornar mensaje si no hay usuarios con gasto mayor a 200 en ese mes', async () => {
    orderRepo.createQueryBuilder = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    });

    const result = await service.getMouthFromUser200('2025-06');

    expect(result).toEqual({
      message: 'No hay usuarios que hallan gastado un total mayor a 200 en el mes 2025-06',
    });
  });

  it('debería lanzar RpcException si ocurre un error', async () => {
    orderRepo.createQueryBuilder = jest.fn(() => {
      throw new Error('Error de base de datos');
    });

    await expect(service.getMouthFromUser200('2025-06')).rejects.toThrow(RpcException);
  });
});

describe('getHistoryUser', () => {
  it('debería retornar resumen e historial agrupado por orden', async () => {
    const mockResumen = { totalComprado: '500', cantidadDeOrdenes: '3' };
    const mockOrders = [
      { id: 'order1', userId: '123', total: '200' },
      { id: 'order2', userId: '123', total: '300' },
    ];
    const mockItems = [
      {
        orderId: 'order1',
        ord_total: '200',
        itemsOrder_quantity: 2,
        itemsOrder_productId: 'prod1',
        itemsOrder_price: '100',
        itemsOrder_updatedAt: '2025-06-01T00:00:00Z',
      },
      {
        orderId: 'order2',
        ord_total: '300',
        itemsOrder_quantity: 3,
        itemsOrder_productId: 'prod2',
        itemsOrder_price: '100',
        itemsOrder_updatedAt: '2025-06-02T00:00:00Z',
      },
    ];

    // Mock del resumen
    orderRepo.createQueryBuilder = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(mockResumen),
    });

    // Mock de órdenes
    orderRepo.find = jest.fn().mockResolvedValue(mockOrders);

    // Mock de items
    orderItemRepo.createQueryBuilder = jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(mockItems),
    });

    const result = await service.getHistoryUser('123');

    expect(result).toEqual({
      result: mockResumen,
      groupedArray: [
        {
          orderId: 'order1',
          total: '200',
          items: [
            {
              quantity: 2,
              productId: 'prod1',
              price: '100',
              updatedAt: '2025-06-01T00:00:00Z',
            },
          ],
        },
        {
          orderId: 'order2',
          total: '300',
          items: [
            {
              quantity: 3,
              productId: 'prod2',
              price: '100',
              updatedAt: '2025-06-02T00:00:00Z',
            },
          ],
        },
      ],
    });
  });

  it('debería lanzar RpcException si ocurre un error', async () => {
    orderRepo.createQueryBuilder = jest.fn(() => {
      throw new Error('DB Error');
    });

    await expect(service.getHistoryUser('123')).rejects.toThrow(RpcException);
  });
});


describe('getProductsMouthBestSellers', () => {
  it('debería retornar los productos más vendidos por mes', async () => {
    const mockResult = [
      {
        mes: '2025-05',
        productId: '386ec4ee-c163-4cfe-bf95-e1363e968cbd',
        total_vendido: '30',
      },
    ];

    const queryMock = jest
      .spyOn(service['dataSource'], 'query')
      .mockResolvedValue(mockResult);

    const result = await service.getProductsMouthBestSellers();

    expect(result).toEqual(mockResult);
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('debería lanzar RpcException si ocurre un error', async () => {
    jest
      .spyOn(service['dataSource'], 'query')
      .mockRejectedValue(new Error('DB error'));

    await expect(service.getProductsMouthBestSellers()).rejects.toThrow(RpcException);
  });
});







});
