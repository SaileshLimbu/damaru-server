import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { EncryptionService } from '../encryption/encryption.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { EXCLUDE_INTERCEPTOR_KEY } from './ExcludeEncryptionInterceptor';
import { Json } from '../../common/interfaces/json';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const isExcluded = this.reflector.get<boolean>(EXCLUDE_INTERCEPTOR_KEY, context.getHandler());

    if (isExcluded) {
      console.log('Skipping interception as this route is excluded');
      // If the handler has the exclude interceptor metadata, skip this interceptor
      return next.handle();
    } else {
      console.log('Intercepting request and decrypting');
      let decryptedData: { payload: Json; aesKey: string } = null;
      if (request.body) {
        decryptedData = this.encryptionService.hybridDecrypt(request.body as string);
        request.body = JSON.parse(JSON.stringify(decryptedData.payload));
      }
      return next.handle().pipe(
        map((data) => {
          // Encrypt outgoing response data
          const encryptedData = this.encryptionService.aesEncrypt(JSON.stringify(data), decryptedData.aesKey);
          console.log({ encryptedData });
          return { encryptedData };
        })
      );
    }
  }
}
