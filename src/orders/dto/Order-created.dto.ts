
import { IsString, IsEnum, IsOptional, IsUUID, IsNotEmpty, IsEmail } from 'class-validator';
import { TodoListState } from '../enums/enums';
import { NotIncludeWord } from './Custom-Validations/CustomValidator';

export class OrderUserDto {
  @IsString()
  @IsNotEmpty()
  
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

}


export class SearTodoListByKeyword {
  @IsString()
  @IsNotEmpty()
  word : string
}
