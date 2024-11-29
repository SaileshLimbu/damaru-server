import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EmulatorUserDto {
  @ApiProperty()
  @IsString()
  device_id: string;

  @ApiProperty()
  @IsString()
  device_name: string;
}
