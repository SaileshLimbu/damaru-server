import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EmulatorStatus } from '../interfaces/emulator.status';

export class EmulatorDto {
  @ApiProperty()
  @IsString()
  device_id: string;

  @ApiProperty()
  @IsString()
  device_name: string;

  @IsOptional()
  @IsEnum(EmulatorStatus)
  status: EmulatorStatus;
}
