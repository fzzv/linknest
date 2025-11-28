import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ImportBookmarksDto {
  @ApiProperty({
    description: 'Chrome 导出的书签 HTML 内容（不上传文件时使用此字段）',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  html?: string;
}

export class ImportBookmarksResultDto {
  @ApiProperty({ example: 10 })
  importedCategories!: number;

  @ApiProperty({ example: 50 })
  importedLinks!: number;
}
