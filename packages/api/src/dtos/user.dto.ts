import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { User } from "db/database";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  avatarUrl?: string;
}

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
}

export function mapUser(entity: User): UserResponseDto {
  return {
    id: entity.id,
    username: entity.username,
    email: entity.email,
    avatarUrl: entity.avatar_url,
  }
}
