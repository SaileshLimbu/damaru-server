import { IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApkDto {
  @ApiProperty()
  @IsNumber()
  version: number;

  @ApiProperty()
  @IsBoolean()
  force: boolean;
}