import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({ example: 'GitHub' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'https://github.com' })
  @IsUrl()
  url!: string;

  @ApiProperty({ example: 'Code hosting platform', required: false, nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: 'https://github.githubassets.com/favicons/favicon.png', required: false, nullable: true })
  @IsOptional()
  @IsString()
  icon?: string | null;

  @ApiProperty({ example: 'https://example.com/cover.png', required: false, nullable: true })
  @IsOptional()
  @IsString()
  cover?: string | null;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateLinkDto extends PartialType(CreateLinkDto) {}

export class LinkDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'GitHub' })
  title!: string;

  @ApiProperty({ example: 'https://github.com' })
  url!: string;

  @ApiProperty({ example: 'Code hosting platform', required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'data:image/png;base64,...', required: false, nullable: true })
  icon!: string | null;

  @ApiProperty({ example: 'https://example.com/cover.png', required: false, nullable: true })
  cover!: string | null;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: 1 })
  categoryId!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: false })
  isPublic!: boolean;

  @ApiProperty({ example: 100 })
  viewCount!: number;

  @ApiProperty({ example: 50 })
  likeCount!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
