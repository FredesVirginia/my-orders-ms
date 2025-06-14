import { Controller, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/Coupon.dto';
import { Coupon } from './entity/coupon.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('coupon')
export class CouponController {

    constructor(private readonly couponService : CouponService){}

    @MessagePattern('create-coupon')
    @Post()
    async createdCoupon(@Payload() couponDto : CreateCouponDto){
        const newCoupon = await this.couponService.createCoupon(couponDto)
        return newCoupon
    }
  
}
