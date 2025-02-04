import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DamaruResponse } from '../../common/interfaces/DamaruResponse';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly SUCCESS_MESSAGE = 'Success';

  constructor(private readonly encryptionService: EncryptionService) {}

  async intercept(_: ExecutionContext, next: CallHandler): Promise<Observable<DamaruResponse | string>> {
    const encryption = await this.encryptionService.getEncryption();

    return next.handle().pipe(
      map((data) => {
        if (encryption.enabled) {
          return JSON.parse(JSON.stringify(data));
        }
        const message = data.message ?? this.SUCCESS_MESSAGE;
        delete data?.message;
        data = data?.data;
        return {
          status: true,
          message,
          data: Array.isArray(data) ? data : data
        };
      })
    );
  }
}
