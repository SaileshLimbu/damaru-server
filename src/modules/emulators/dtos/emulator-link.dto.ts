import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class EmulatorLinkDto {
  @ApiProperty()
  @IsString()
  device_id: string;

  @ApiProperty()
  @IsNumber()
  account_id: number;
}
