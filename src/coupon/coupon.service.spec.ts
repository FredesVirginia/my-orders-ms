
import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Coupon } from './entity/coupon.entity';

const mockCouponRepo = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(), // ← esto es necesario ahora
});


describe('CouponService', () => {
  let service: CouponService;
  let repo: jest.Mocked<Repository<Coupon>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: getRepositoryToken(Coupon),
          useFactory: mockCouponRepo,
        },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    repo = module.get(getRepositoryToken(Coupon));
  });

  describe('createCoupon', () => {
    it('debería guardar y retornar un nuevo cupón', async () => {
      const dto = { name: 'DESC10', discount: 10 };
      const savedCoupon = { id: '1', ...dto };

      repo.save.mockResolvedValue(savedCoupon as any);

      const result = await service.createCoupon(dto);
      expect(result).toEqual(savedCoupon);
      expect(repo.save).toHaveBeenCalledWith(dto);
    });

    it('debería lanzar RpcException si hay un error al guardar', async () => {
      repo.save.mockRejectedValue(new Error('Error en DB'));

      await expect(service.createCoupon({ name: 'X', discountPercent: 5 }))
        .rejects.toThrow(RpcException);
    });
  });

  describe('lookForCoupon', () => {
  it('debería retornar un cupón encontrado', async () => {
    const nameCode = 'DESC20';
    const found = { id: '1', name: nameCode, discount: 20 };

    repo.findOne.mockResolvedValue(found as any);

    const result = await service.lookForCoupon(nameCode);
    expect(result).toEqual(found);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { name: nameCode } });
  });

  it('debería lanzar RpcException si no se encuentra ningún cupón', async () => {
    repo.findOne.mockResolvedValue(null); // 👈 ahora usamos null, no []

    await expect(service.lookForCoupon('INVALIDO'))
      .rejects.toThrow(RpcException);
  });

  it('debería lanzar RpcException si ocurre un error en base de datos', async () => {
    repo.findOne.mockRejectedValue(new Error('DB error'));

    await expect(service.lookForCoupon('XXX'))
      .rejects.toThrow(RpcException);
  });
});

});
