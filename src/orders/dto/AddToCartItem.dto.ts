import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number; // cantidad deseada
}

export class UpdateCartDto extends AddToCartDto{}
