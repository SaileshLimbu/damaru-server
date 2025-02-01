import { IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApkDto {
  @ApiProperty()
  @IsNumber()
  version: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: Express.Multer.File;

  @ApiProperty()
  @IsBoolean()
  force: boolean;
}
