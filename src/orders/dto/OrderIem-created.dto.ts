import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  productId: string;

  
 @IsNotEmpty()
   @IsString()
  price: string;
}