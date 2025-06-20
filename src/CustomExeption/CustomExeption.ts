import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class CustomRpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();
    // Si es string, envía como mensaje, si es objeto, envía su mensaje o el objeto completo
    const errorResponse = typeof error === 'string' ? { message: error } : error;
    return throwError(() => errorResponse);
  }
}
