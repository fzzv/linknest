import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UploadRequestDto {
  @ApiProperty({ description: '业务目录，例如 avatars、covers、imports/bookmarks', required: false })
  @IsOptional()
  @IsString()
  dir?: string;

  @ApiProperty({ description: '可选：关联的实体类型，用于创建 FileAttachment 记录', required: false, example: 'User' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ description: '可选：关联的实体 ID（与 entityType 一起使用）', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  entityId?: number;

  @ApiProperty({ description: '可选：文件用途标签，例如 avatar、cover、import_source', required: false })
  @IsOptional()
  @IsString()
  usage?: string;
}

export class UploadedFileDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'avatar.png' })
  originalName!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000.png' })
  filename!: string;

  @ApiProperty({ example: 'image/png' })
  mimeType!: string;

  @ApiProperty({ example: 204800 })
  size!: number;

  @ApiProperty({ example: 'png', nullable: true, required: false })
  ext!: string | null;

  @ApiProperty({ example: 'avatars' })
  dir!: string;

  @ApiProperty({ example: 'uploads/avatars/550e8400-e29b-41d4-a716-446655440000.png' })
  path!: string;

  @ApiProperty({ example: '/uploads/avatars/550e8400-e29b-41d4-a716-446655440000.png' })
  url!: string;

  @ApiProperty({ example: 2, nullable: true })
  uploaderId!: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class UploadFilesResponseDto {
  @ApiProperty({ type: UploadedFileDto, isArray: true })
  files!: UploadedFileDto[];
}
