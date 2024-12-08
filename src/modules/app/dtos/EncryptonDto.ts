import { IsOptional, IsString } from 'class-validator';

export class EncryptionDto {
  @IsOptional()
  @IsString() // Ensures 'key' is a string if it exists
  key?: string;

  [key: string]: any; // Allow any other keys in the object
}
