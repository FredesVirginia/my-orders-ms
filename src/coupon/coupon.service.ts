import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
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

  
  async createCoupon ( dto : CreateCouponDto){
   try{
      return dto
   }catch(error){
    console.log("El error fue" )
    throw new RpcException({
      message : error
    })
   }
  }
    
}
