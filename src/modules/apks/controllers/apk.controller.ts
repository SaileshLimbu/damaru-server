import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { ExcludeInterceptor } from '../../../core/middlewares/ExcludeEncryptionInterceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuperAdmin } from '../../../core/guards/super_admin.guard';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';
import { ApkService } from '../services/apk.service';
import { ApkDto } from '../../app/dtos/ApkDto';
import { Response } from 'express';

@ApiTags('Apks')
@ApiBearerAuth()
@Controller('apks')
export class ApkController {
  constructor(private readonly apkService: ApkService) {}

  @ExcludeInterceptor()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: ApkDto,
    description: 'Apk data'
  })
  async uploadApk(@Body() apkDto: ApkDto, @UploadedFile() file: Express.Multer.File): Promise<DamaruResponse> {
    return this.apkService.uploadApk(apkDto, file);
  }

  @ExcludeInterceptor()
  @Get('get')
  async getApk() {
    const apk = await this.apkService.getLatestApkPath();
    return { message: 'Latest apk details', data: { ...apk, link: `${this.apkService.getApkDownloadLink()}` } };
  }

  @ExcludeInterceptor()
  @Get('download')
  async downloadFile(@Res() res: Response) {
    const filePath = await this.apkService.getLatestApkPath();
    res.download(filePath.link);
    return { link: filePath.link, message: 'Apk has been downloaded successfully' };
  }
}
