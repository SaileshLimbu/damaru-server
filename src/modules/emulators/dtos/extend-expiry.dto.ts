import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ExtendExpiryDto {
  @ApiProperty()
  @IsString()
  device_id: string;

  @ApiProperty()
  @IsString()
  user_id: string;

  @ApiProperty()
  @IsNumber()
  days?: number;
}
