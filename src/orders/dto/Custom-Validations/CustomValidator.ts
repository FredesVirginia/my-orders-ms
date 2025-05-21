import {ValidatorConstraint,ValidatorConstraintInterface,ValidationArguments,ValidationOptions,registerDecorator} from 'class-validator';
import { TodoListTitleNotAdmited } from 'src/orders/enums/enums';

@ValidatorConstraint({ name: 'notIncludeWord', async: false })
export class NotIncludeWordContrain implements ValidatorConstraintInterface {
  validate(word: string, args: ValidationArguments) {
    
    if (typeof word !== 'string') return false;

    const lowerWord = word.toLowerCase();

    return !(
      lowerWord.includes(TodoListTitleNotAdmited.DEFAULT.toLowerCase()) ||
      lowerWord.includes(TodoListTitleNotAdmited.PRUEBA.toLowerCase()) ||
      lowerWord.includes(TodoListTitleNotAdmited.TEST.toLowerCase())
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'El título de la tarea no puede contener las palabras: test, prueba, default';
  }
}

export function NotIncludeWord(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NotIncludeWordContrain,
    });
  };
}

