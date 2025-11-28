import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'LinkNest 用户', nullable: true, required: false })
  nickname!: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.png', nullable: true, required: false })
  avatar!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class MessageResponseDto {
  @ApiProperty({ example: '验证码已发送' })
  message!: string;
}

export class RegisterResponseDto {
  @ApiProperty({ type: () => UserDto })
  user!: UserDto;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ type: () => UserDto })
  user!: UserDto;
}
