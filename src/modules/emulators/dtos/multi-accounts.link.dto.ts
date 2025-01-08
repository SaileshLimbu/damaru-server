import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { MultiAccounts } from '../interfaces/multi-accounts';

export class MultiAccountsLinkDto implements MultiAccounts {
  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsArray()
  accountIds: Array<string>;

  @ApiProperty()
  @IsString()
  userId: string;
}
