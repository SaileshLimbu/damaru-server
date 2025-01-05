import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { Actions } from '../enums/Actions';

export class CreateActivityLogDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  account_id?: string;

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
