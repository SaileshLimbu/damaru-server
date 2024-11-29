import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  account_name: string;

  @ApiProperty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  pin: number;
}
