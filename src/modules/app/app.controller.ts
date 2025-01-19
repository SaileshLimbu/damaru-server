import { Body, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EncryptionService } from '../../core/encryption/encryption.service';
import { JwtAuthGuard } from '../../core/guards/jwt.guard';
import { SuperAdmin } from '../../core/guards/super_admin.guard';
import { EncryptionDto } from './dtos/EncryptonDto';
import { ExcludeInterceptor } from '../../core/middlewares/ExcludeEncryptionInterceptor';
import { ConfigService } from '@nestjs/config';
import { DamaruResponse } from '../../common/interfaces/DamaruResponse';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

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
  encrypt(@Body() jsonToEncrypt: EncryptionDto): DamaruResponse {
    const key = jsonToEncrypt.key ?? this.configService.get('DEFAULT_AES_KEY');
    console.log('key for encryption', key);
    const rsaEncryptedKey = this.encryptionService.rsaEncrypt(key);
    return {
      message: 'Data Encrypted',
      data: rsaEncryptedKey + this.encryptionService.aesEncrypt(JSON.stringify(jsonToEncrypt), key)
    };
  }

  @ApiConsumes('text/plain')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @ExcludeInterceptor()
  @Post('decrypt')
  decrypt(@Body() encryptedText: string): DamaruResponse {
    return {
      message: 'Data decrypted',
      data: JSON.parse(this.encryptionService.hybridDecrypt(encryptedText).toString())
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @ExcludeInterceptor()
  @Get('encryption/:status')
  async toggleEncryption(@Param('status') status: boolean): Promise<DamaruResponse> {
    return {
      message: 'Encryption status fetched',
      data: await this.encryptionService.toggleEncryption(status.toString() === 'true')
    };
  }

  @ExcludeInterceptor()
  @Post('apk/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } }
    }
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<DamaruResponse> {
    return {
      message: 'Apk has been uploaded successfully',
      data: {
        originalName: file.originalname,
        savedFileName: file.filename,
        path: file.path
      }
    };
  }

  @ExcludeInterceptor()
  @Get('apk/download')
  downloadFile(@Res() res: Response) {
    const filePath = this.appService.getApkPath();
    res.download(filePath);
    return { link: filePath, message: 'Apk has been downloaded successfully' };
  }
}
