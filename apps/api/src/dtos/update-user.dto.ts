import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'LinkNest 用户', required: false, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(30)
  nickname?: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(2048)
  avatar?: string | null;
}
