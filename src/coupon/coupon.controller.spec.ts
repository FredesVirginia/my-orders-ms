
import { Test, TestingModule } from '@nestjs/testing';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/Coupon.dto';

describe('CouponController', () => {
  let controller: CouponController;
  let service: CouponService;

  const mockCouponService = {
    createCoupon: jest.fn(),
    lookForCoupon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        {
          provide: CouponService,
          useValue: mockCouponService,
        },
      ],
    }).compile();

    controller = module.get<CouponController>(CouponController);
    service = module.get<CouponService>(CouponService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // limpia mocks entre tests
  });

  describe('createdCoupon', () => {
    it('debería llamar a createCoupon y devolver el nuevo cupón', async () => {
      const dto: CreateCouponDto = { name: 'DESC15', discountPercent: 15 };
      const expectedCoupon = { id: '1', ...dto };

      mockCouponService.createCoupon.mockResolvedValue(expectedCoupon);

      const result = await controller.createdCoupon(dto);
      expect(result).toEqual(expectedCoupon);
      expect(service.createCoupon).toHaveBeenCalledWith(dto);
    });
  });

  describe('lookForCoupon', () => {
    it('debería llamar a lookForCoupon y retornar el cupón encontrado', async () => {
      const nameCoupon = 'DESC20';
      const foundCoupon = { id: '2', name: nameCoupon, discount: 20 };

      mockCouponService.lookForCoupon.mockResolvedValue(foundCoupon);

      const result = await controller.lookForCoupon(nameCoupon);
      expect(result).toEqual(foundCoupon);
      expect(service.lookForCoupon).toHaveBeenCalledWith(nameCoupon);
    });
  });
});
