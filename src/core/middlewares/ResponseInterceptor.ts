import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DamaruResponse } from '../../common/interfaces/DamaruResponse';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly SUCCESS_MESSAGE = 'Success';

  intercept(_: ExecutionContext, next: CallHandler): Observable<DamaruResponse> {
    return next.handle().pipe(
      map((data) => {
        const message = data.message ?? this.SUCCESS_MESSAGE;
        delete data?.message
        data =  data?.data;
        return {
          status: true,
          message,
          data: Array.isArray(data) ? data : data
        };
      })
    );
  }
}
