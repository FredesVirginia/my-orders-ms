
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { OrderItemDto } from './OrderIem-created.dto';

export class OrderDto {
  @IsString()
  @IsNotEmpty()
   userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
   items : OrderItemDto[]

}


export class SearTodoListByKeyword {
  @IsString()
  @IsNotEmpty()
  word : string
}
