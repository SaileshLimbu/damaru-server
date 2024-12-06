import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { EncryptionService } from '../encryption/encryption.service';
import { Request } from 'express';

interface EncryptedData {
  data: string;
}

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    console.log(request.body);
    // Decrypt incoming request data
    if (request.body) {
      const data = (request.body as EncryptedData).data;
      const decryptedData = this.encryptionService.hybridDecrypt(data);
      request.body = JSON.parse(decryptedData);
    }
    return next.handle().pipe(
      map((data) => {
        // Encrypt outgoing response data
        // const encryptedData = this.encryptionService.aesEncrypt(JSON.stringify(data));
        return {};
      })
    );
  }
}
