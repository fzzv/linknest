import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌', example: 'eyJhbGciOiJI...' })
  @IsString({ message: 'refreshToken 不能为空' })
  refreshToken!: string;
}
