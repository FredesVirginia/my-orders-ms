import { Controller, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/Coupon.dto';

@Controller('coupon')
export class CouponController {

    constructor(private readonly couponService : CouponService){}

    @MessagePattern('create-coupon')
    @Post()
    async createdCoupon(@Payload() couponDto : CreateCouponDto){
       
        const newCoupon = await this.couponService.createCoupon(couponDto)
        return newCoupon
    }


    @MessagePattern('look-for')
    @Post()
    async lookForCoupon(@Payload() nameCoupon : string){
        const coupon = await this.couponService.lookForCoupon(nameCoupon);
        return coupon;
    }
  
}
