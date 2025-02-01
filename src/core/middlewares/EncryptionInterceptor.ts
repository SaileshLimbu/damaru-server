import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
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

  async intercept(context: ExecutionContext, next: CallHandler) {
    if ((await this.encryptionService.getEncryption()).enabled) {
      try {
        const request: Request = context.switchToHttp().getRequest();
        const isExcluded = this.reflector.get<boolean>(EXCLUDE_INTERCEPTOR_KEY, context.getHandler());
        if (isExcluded) {
          console.log('Skipping interception as this route is excluded');
          // If the handler has the exclude interceptor metadata, skip this interceptor
          return next.handle();
        } else {
          console.log('Intercepting request and decrypting');
          let decryptedData: { data: Json; aesKey: string; rsaKey: string } = null;
          if(Object.keys(request.body).length === 0) {
            const xMetadata = request.headers['x-metadata'].toString();
            const encryptedKey = xMetadata.substring(5)
            decryptedData = {
              aesKey: this.encryptionService.rsaDecrypt(encryptedKey),
              data: null,
              rsaKey: null
            };
          }
          else {
            decryptedData = this.encryptionService.hybridDecrypt(request.body as string);
            request.body = JSON.parse(JSON.stringify(decryptedData.data));
            if (request.body.password) {
              console.log('Decrypted request body', { ...request.body, password: 'xxxx' });
            }
          }
          return next.handle().pipe(
            map((data) => {
              // Encrypt outgoing response data
              console.log('response', data);
              const encryptedData = this.encryptionService.aesEncrypt(JSON.stringify(data), decryptedData.aesKey);
              console.log({ encryptedData });
              return encryptedData;
            })
          );
        }
      } catch (error) {
        console.log('Failed to decrypt request parameters');
        throw new BadRequestException('Failed to process your request,[Encryption/Decryption error]');
      }
    } else {
      console.log('Encryption has been disabled in database');
      return next.handle();
    }
  }
}
