import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  account_name: string;

  @ApiProperty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  pin: string;

  @IsOptional()
  @IsBoolean()
  is_admin: boolean;
}
