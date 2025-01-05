import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {

  @ApiProperty()
  @IsString()
  account_name: string;

  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  pin: string;

  @IsOptional()
  @IsBoolean()
  is_admin: boolean;
}
