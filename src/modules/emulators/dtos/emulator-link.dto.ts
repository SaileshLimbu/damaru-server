import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class EmulatorLinkDto {
  @ApiProperty()
  @IsString()
  device_id: string;

  @ApiProperty()
  @IsNumber()
  user_id: number;

  @IsOptional()
  @IsDate()
  expiry_at?: Date;
}
