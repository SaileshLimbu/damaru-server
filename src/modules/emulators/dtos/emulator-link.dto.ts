import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class EmulatorLinkDto {
  @ApiProperty()
  @IsString()
  device_id: string;

  @ApiProperty()
  @IsNumber()
  user_id: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  account_id?: number;

  @IsOptional()
  @IsDate()
  connected_at?: Date;

  @IsOptional()
  @IsDate()
  expiry_at?: Date;
}
