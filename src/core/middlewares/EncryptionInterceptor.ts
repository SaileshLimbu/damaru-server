import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { EncryptionService } from '../encryption/encryption.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { EXCLUDE_INTERCEPTOR_KEY } from './ExcludeEncryptionInterceptor';
import { Json } from '../../common/interfaces/json';
import { of } from 'rxjs';
import { DamaruException } from '../../common/interfaces/DamaruException';
import { ConfigService } from '@nestjs/config';
import { Environments } from '../../common/interfaces/environments';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    if ((await this.encryptionService.getEncryption()).enabled) {
      const isDev = this.configService.get('ENVIRONMENT') === Environments.DEVELOPMENT.toString();

      try {
        const request: Request = context.switchToHttp().getRequest();
        const isExcluded = this.reflector.get<boolean>(EXCLUDE_INTERCEPTOR_KEY, context.getHandler());
        if (isExcluded) {
          // If the handler has the exclude interceptor metadata, skip this interceptor
          return next.handle();
        } else {
          console.log('Intercepting request and decrypting');
          let decryptedData: { data: Json; aesKey: string; rsaKey: string } = null;
          if (Object.keys(request.body).length === 0) { // get delete request
            const xMetadata = request.headers['x-metadata']?.toString();
            if(!xMetadata){
              throw new BadRequestException('x-metadata header is required');
            }
            const encryptedKey = xMetadata.substring(5);
            decryptedData = {
              aesKey: this.encryptionService.rsaDecrypt(encryptedKey),
              data: null,
              rsaKey: null
            };
          } else {
            decryptedData = this.encryptionService.hybridDecrypt(request.body as string);
            request.body = JSON.parse(JSON.stringify(decryptedData.data));
            if (request.body.password) {
              console.log('Decrypted request body', { ...request.body, password: 'xxxx' });
            }
          }
          return next.handle().pipe(
            catchError((error) => {
              const damaruError = error as DamaruException;
              console.log('Error occurred during request processing', damaruError);
              const exception = {
                status: false,
                message: damaruError.message
              };
              if (isDev) {
                exception['stack'] = damaruError.stack;
              }
              return of(exception);
            }),
            map((data) => {
              return this.encryptionService.aesEncrypt(JSON.stringify(data), decryptedData.aesKey);
            })
          );
        }
      } catch (error) {
        console.log('Failed to decrypt request parameters', error);
        return isDev ? of({
          status: false,
          message: 'Failed to decrypt request parameters',
          stack: error.stack
        }) : of({
          status: false,
          message: 'Failed to decrypt request parameters'
        });
      }
    } else {
      console.warn('Encryption has been disabled in database');
      return next.handle();
    }
  }
}
