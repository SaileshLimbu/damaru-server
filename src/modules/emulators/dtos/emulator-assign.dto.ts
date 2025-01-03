import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { EmulatorLinkDto } from './emulator-link.dto';

export class EmulatorAssignDto extends EmulatorLinkDto {
  @ApiProperty()
  @IsArray()
  accountIds: Array<number>;
}
