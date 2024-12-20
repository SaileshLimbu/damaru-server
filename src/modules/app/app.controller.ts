import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EncryptionService } from '../../core/encryption/encryption.service';
import { DecryptedPayload } from '../../core/encryption/DecryptedPayload';
import { JwtAuthGuard } from '../../core/guards/jwt.guard';
import { SuperAdmin } from '../../core/guards/super_admin.guard';
import { EncryptionDto } from './dtos/EncryptonDto';
import { ExcludeInterceptor } from '../../core/middlewares/ExcludeEncryptionInterceptor';
import { ConfigService } from '@nestjs/config';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService
  ) {}

  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ description: '{"message" : "OK"}', status: 200 })
  @Get()
  checkHealth(): string {
    return this.appService.checkHealth();
  }

  @ApiConsumes('application/json')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @Post('encrypt')
  @ApiBody({
    type: EncryptionDto,
    description: 'Encryption JSON'
  })
  @ExcludeInterceptor()
  encrypt(@Body() jsonToEncrypt: EncryptionDto): string {
    const key = jsonToEncrypt.key ?? this.configService.get('DEFAULT_AES_KEY');
    console.log('key for encryption', key);
    const rsaEncryptedKey = this.encryptionService.rsaEncrypt(key);
    return rsaEncryptedKey + this.encryptionService.aesEncrypt(JSON.stringify(jsonToEncrypt), key);
  }

  @ApiConsumes('text/plain')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @ExcludeInterceptor()
  @Post('decrypt')
  decrypt(@Body() encryptedText: string): DecryptedPayload {
    return this.encryptionService.hybridDecrypt(encryptedText);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @ExcludeInterceptor()
  @Get('encryption/:status')
  toggleEncryption(@Param('status') status: boolean): Promise<string> {
    return this.encryptionService.toggleEncryption(status.toString() === 'true');
  }
}
