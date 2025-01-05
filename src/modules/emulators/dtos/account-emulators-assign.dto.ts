import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class AccountEmulatorsAssignDto {
  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsArray()
  device_ids: Array<string>;

  @ApiProperty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsDate()
  expiry_at?: Date;
}
