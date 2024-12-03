import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Actions } from '../enums/Actions';

export class CreateActivityLogDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  account_id?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  device_id?: string;

  @ApiProperty()
  @IsEnum(Actions)
  action: Actions;

  @ApiProperty()
  @IsObject()
  metadata: object;
}
