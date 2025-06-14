// dto/create-coupon.dto.ts
import { IsString, IsNumber, IsOptional, IsDate, Min, Max, Validate, IsBoolean, ValidationArguments, Length, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

// Validador personalizado para fechas
class IsAfterStartDate {
  validate(validUntil: Date, args: ValidationArguments) {
    const coupon = args.object as CreateCouponDto;
    return !coupon.validFrom || validUntil > coupon.validFrom;
  }

  defaultMessage() {
    return 'validUntil debe ser posterior a validFrom';
  }
}
export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
 
  name: string;

  



  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercent?: number; // Descuento porcentual (15%)

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Validate(IsAfterStartDate) // Validación personalizada (ver abajo)
  validUntil?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsage?: number;
}

