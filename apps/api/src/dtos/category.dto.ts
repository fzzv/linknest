import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import { LinkDto } from './link.dto';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Work' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: 1, required: false, nullable: true })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1)
  parentId?: number | null;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategoryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Work' })
  name!: string;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: false })
  isPublic!: boolean;

  @ApiProperty({ example: 3 })
  count!: number;

  @ApiProperty({ example: 1, nullable: true })
  parentId!: number | null;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class CategoryTreeDto extends CategoryDto {
  @ApiProperty({ type: () => [CategoryTreeDto] })
  children!: CategoryTreeDto[];

  @ApiProperty({ type: () => [LinkDto] })
  links!: LinkDto[];
}
