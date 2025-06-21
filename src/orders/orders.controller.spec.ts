import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

 const mockOrderService = {
  createOrder: jest.fn(),
  getAllOrdersByUser: jest.fn(),
  addCart: jest.fn(),
  deleteCartAfterOrderPost: jest.fn(),
  deleteCart: jest.fn(),
   getCartUserItem: jest.fn(),
  getAllTotalOrderByUser: jest.fn(),
  getProductForMountAverageByUser: jest.fn(),
  getMouthUser200: jest.fn(),
  getProductsBestSellerMout: jest.fn(),
  getUserMouth200 : jest.fn(),
  getMouthFromUser200 : jest.fn() , 
  getProductsMouthBestSellers : jest.fn(),
  getUser200mouth : jest.fn(),
  getHistoryUser : jest.fn()



};


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('debería crear una orden con orderDto y coupon', async () => {
      const payload = {
        orderDto: { userId: '123', total: '100' },
        coupon: 'COUPON123',
      };

      const expectedResult = { id: 'order123', ...payload.orderDto };
      mockOrderService.createOrder.mockResolvedValue(expectedResult);

      const result = await controller.createOrder(payload);

      expect(service.createOrder).toHaveBeenCalledWith(payload.orderDto, payload.coupon);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getOrdersByUser', () => {
    it('debería retornar órdenes del usuario', async () => {
      const userId = '123';
      const mockOrders = [{ id: 'order1' }, { id: 'order2' }];
      mockOrderService.getAllOrdersByUser.mockResolvedValue(mockOrders);

      const result = await controller.getOrdersByUser(userId);

      expect(service.getAllOrdersByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockOrders);
    });
  });




  describe('addToCart', () => {
  it('debería agregar un producto al carrito', async () => {
    const payload = {
      user: { userId: 'user123' },
      data: { productId: 'prod1', quantity: 2 },
    };

    const expected = { success: true };
    mockOrderService.addCart = jest.fn().mockResolvedValue(expected);

    const result = await controller.addToCart(payload);

    expect(service.addCart).toHaveBeenCalledWith(payload.user.userId, payload.data);
    expect(result).toEqual(expected);
  });
});

describe('deleteCartAftherOrder', () => {
  it('debería eliminar el carrito después de crear una orden', async () => {
    const userId = 'user123';
    const expected = { deleted: true };
    mockOrderService.deleteCartAfterOrderPost = jest.fn().mockResolvedValue(expected);

    const result = await controller.deleteCartAftherOrder(userId);

    expect(service.deleteCartAfterOrderPost).toHaveBeenCalledWith(userId);
    expect(result).toEqual(expected);
  });
});

describe('deleteCart', () => {
  it('debería eliminar un producto del carrito', async () => {
    const payload = {
      user: { userId: 'user123' },
      data: { productId: 'prod1', quantity: 1 }, // ✅ agregá quantity
    };

    const expected = { success: true };
    mockOrderService.deleteCart = jest.fn().mockResolvedValue(expected);

    const result = await controller.deleteCart(payload);

    expect(service.deleteCart).toHaveBeenCalledWith(payload.user.userId, payload.data);
    expect(result).toEqual(expected);
  });
});



describe('OrderController', () => {
  let controller: OrderController;
  const mockOrderService = {
    getCartUserItem: jest.fn(),
    getAllTotalOrderByUser: jest.fn(),
    getProductForMountAverageByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAddToCart', () => {
    it('debería llamar a getCartUserItem con el usuario correcto y devolver resultado', async () => {
      const userPayload = { user: { userId: 'user123' } };
      const expectedResult = { items: [] };

      mockOrderService.getCartUserItem.mockResolvedValue(expectedResult);

      const result = await controller.getAddToCart(userPayload);

      expect(mockOrderService.getCartUserItem).toHaveBeenCalledWith(userPayload.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllTotalOrder', () => {
    it('debería llamar a getAllTotalOrderByUser con el userId correcto y devolver resultado', async () => {
      const userId = 'user123';
      const expectedResult = { totalCompras: 100 };

      mockOrderService.getAllTotalOrderByUser.mockResolvedValue(expectedResult);

      const result = await controller.getAllTotalOrder(userId);

      expect(mockOrderService.getAllTotalOrderByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProductByUserForMouth', () => {
    it('debería llamar a getProductForMountAverageByUser con el userId correcto y devolver resultado', async () => {
      const userId = 'user123';
      const expectedResult = [
        { mes: '2025-06', cantidadProductos: '5', promedio: '3.4' },
      ];

      mockOrderService.getProductForMountAverageByUser.mockResolvedValue(expectedResult);

      const result = await controller.getProductByUserForMouth(userId);

      expect(mockOrderService.getProductForMountAverageByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });
});




describe('getMouthUser200', () => {
    it('debería llamar a getMouthFromUser200 con el mes correcto y devolver el resultado', async () => {
      const mes = '2025-06';
      const expected = [
        { usuarios: 'user1', total: '450' },
        { usuarios: 'user2', total: '300' },
      ];

      mockOrderService.getMouthFromUser200.mockResolvedValue(expected);

      const result = await controller.getMouthUser200(mes);

      expect(mockOrderService.getMouthFromUser200).toHaveBeenCalledWith(mes);
      expect(result).toEqual(expected);
    });
  });

  describe('getProductsBestSellerMout', () => {
    it('debería llamar a getProductsMouthBestSellers y devolver los productos más vendidos', async () => {
      const expected = [
        {
          mes: '2025-05',
          productId: 'abc-123',
          total_vendido: '40',
        },
      ];

      mockOrderService.getProductsMouthBestSellers.mockResolvedValue(expected);

      const result = await controller.getProductsBestSellerMout();

      expect(mockOrderService.getProductsMouthBestSellers).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('getUserMouth200', () => {
    it('debería llamar a getUser200mouth con el userId correcto y devolver resultado', async () => {
      const userId = 'user123';
      const expected = [
        { mes: '2025-05', totalPorMesGastado: '250' },
      ];

      mockOrderService.getUser200mouth.mockResolvedValue(expected);

      const result = await controller.getUserMouth200(userId);

      expect(mockOrderService.getUser200mouth).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });









  describe('getHistory', () => {
    it('debería retornar el historial de compras del usuario', async () => {
      const userId = 'user123';
      const expected = {
        result: { totalComprado: '300', cantidadDeOrdenes: '3' },
        groupedArray: [
          {
            orderId: 'order1',
            total: '100',
            items: [
              {
                quantity: 2,
                productId: 'prod1',
                price: '50',
                updatedAt: '2025-06-01T12:00:00Z',
              },
            ],
          },
        ],
      };

      mockOrderService.getHistoryUser.mockResolvedValue(expected);

      const result = await controller.getHistory(userId);

      expect(mockOrderService.getHistoryUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('handleGetPurchasedProducts', () => {
    it('debería retornar todas las órdenes del usuario', async () => {
      const userId = 'user123';
      const expected = {
        userId: 'user123',
        data: [
          { productId: 'prod1', quantity: '3' },
          { productId: 'prod2', quantity: '2' },
        ],
      };

      mockOrderService.getAllOrdersByUser.mockResolvedValue(expected);

      const result = await controller.handleGetPurchasedProducts(userId);

      expect(mockOrderService.getAllOrdersByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });


});
