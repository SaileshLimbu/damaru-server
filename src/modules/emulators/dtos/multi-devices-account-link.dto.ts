import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MultiDevicesLinkDto } from './multi-devices-link.dto';

export class MultiDevicesAccountLinkDto extends MultiDevicesLinkDto {
  @ApiProperty()
  @IsString()
  accountId: string;
}