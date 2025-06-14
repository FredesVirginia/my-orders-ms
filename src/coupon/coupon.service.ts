import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/Coupon.dto';
import { Coupon } from './entity/coupon.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  async createCoupon(dto: CreateCouponDto) {
    try {
      console.log('LA DATA ES ', dto);
      const newCoupon = await this.couponRepository.save(dto);
      return newCoupon;
    } catch (error) {
      console.log('El error fue');
      throw new RpcException({
        message: error,
      });
    }
  }

  async lookForCoupon(nameCode: string) {
    try {
      const foundCoupon = await this.couponRepository.find({
        where: { name: nameCode },
      });

      if (!foundCoupon) {
        throw new RpcException({
          message: `No se encontro el cupon con el nombre ${nameCode}`,
        });
      }

      return foundCoupon;
    } catch (error) {
      console.log('El error fue');
      throw new RpcException({
        message: error,
      });
    }
  }
}
