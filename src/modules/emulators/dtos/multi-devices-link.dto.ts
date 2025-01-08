import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';
import { MultiDevices } from '../interfaces/multi-devices';

export class MultiDevicesLinkDto implements MultiDevices {
  @ApiProperty()
  @IsArray()
  deviceIds: Array<string>;

  @ApiProperty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsDate()
  expiry_at?: Date;
}
