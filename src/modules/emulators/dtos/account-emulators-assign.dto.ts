import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNumber, IsOptional } from 'class-validator';

export class AccountEmulatorsAssignDto {
  @ApiProperty()
  @IsNumber()
  accountId: number;

  @ApiProperty()
  @IsArray()
  device_ids: Array<string>;

  @ApiProperty()
  @IsNumber()
  user_id: number;

  @IsOptional()
  @IsDate()
  expiry_at?: Date;
}
