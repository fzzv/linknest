import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'refreshToken 不能为空' })
  refreshToken!: string;
}
