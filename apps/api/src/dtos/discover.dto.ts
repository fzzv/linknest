import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

// ==========================================
// Query DTOs
// ==========================================

export class PaginationQueryDto {
  @ApiProperty({ example: 20, required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class FeaturedLinksQueryDto {
  @ApiProperty({ example: 10, required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}

export class CategoryDetailQueryDto extends PaginationQueryDto {
  @ApiProperty({ enum: ['latest', 'popular', 'recommended'], required: false, default: 'recommended' })
  @IsOptional()
  @IsEnum(['latest', 'popular', 'recommended'])
  sort?: 'latest' | 'popular' | 'recommended';
}

export class SearchQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: 'github', required: true })
  @IsString()
  q!: string;
}

// ==========================================
// Response DTOs
// ==========================================

export class FeaturedCategoryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '技术工具' })
  name!: string;

  @ApiProperty({ example: '开发者常用工具集合', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'Code', nullable: true })
  icon!: string | null;

  @ApiProperty({ example: 42 })
  linkCount!: number;
}

export class FeaturedLinkDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'GitHub' })
  title!: string;

  @ApiProperty({ example: 'https://github.com' })
  url!: string;

  @ApiProperty({ example: 'Code hosting platform', nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  icon!: string | null;

  @ApiProperty({ example: 100 })
  viewCount!: number;

  @ApiProperty({ example: 50 })
  likeCount!: number;

  @ApiProperty({ example: false })
  isLiked!: boolean;
}

export class PublicLinkDto extends FeaturedLinkDto {
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ example: { id: 1, name: 'Tech' } })
  category!: { id: number; name: string };
}

export class CategoryDetailDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '技术工具' })
  name!: string;

  @ApiProperty({ example: '开发者常用工具集合', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'Code', nullable: true })
  icon!: string | null;

  @ApiProperty({ type: [PublicLinkDto] })
  links!: PublicLinkDto[];

  @ApiProperty({ example: 42 })
  total!: number;
}

export class LikeResponseDto {
  @ApiProperty({ example: true })
  liked!: boolean;

  @ApiProperty({ example: 51 })
  likeCount!: number;
}
