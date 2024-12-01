import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EmulatorDto {
  @ApiProperty()
  @IsString()
  device_id: string;

  @ApiProperty()
  @IsString()
  device_name: string;
}
