import { BadRequestException, Body, Controller, Post, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { UploadFilesResponseDto, UploadRequestDto } from 'src/dtos';
import { UploadService } from 'src/services/upload.service';
import { ensureUploadDir, sanitizeDir } from 'src/utils/upload.utils';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import type { Request } from 'express';

// 允许的 MIME 前缀和类型
const allowedMimePrefixes = ['image/', 'video/', 'audio/', 'text/'];
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'application/gzip',
  'application/octet-stream',
  'application/xml',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

// 检查 MIME 类型是否允许
function isMimeAllowed(mime: string) {
  return allowedMimePrefixes.some((prefix) => mime.startsWith(prefix)) || allowedMimeTypes.has(mime);
}

// 从请求中获取目录
function getDirFromRequest(req: Request) {
  const bodyDir = Array.isArray((req.body as Record<string, unknown>)?.dir)
    ? (req.body as Record<string, unknown>).dir[0]
    : (req.body as Record<string, unknown>)?.dir;
  if (typeof bodyDir === 'string') {
    return bodyDir;
  }

  const queryDir = req.query?.dir;
  const dir =
    typeof queryDir === 'string'
      ? queryDir
      : 'default';
  return dir
}

// Multer 配置
const uploadMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: (req, _file, cb) => {
      try {
        const dir = sanitizeDir(getDirFromRequest(req));
        // __uploadDir 用于存储上传目录，以便在后续请求中使用
        req.__uploadDir = dir;
        const destination = ensureUploadDir(dir);
        cb(null, destination);
      } catch (error) {
        cb(error as Error, undefined as unknown as string);
      }
    },
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !isMimeAllowed(file.mimetype)) {
      return cb(new BadRequestException('不支持的文件类型'), false);
    }
    cb(null, true);
  },
  // 限制上传文件数量和大小
  limits: {
    files: 20,
    fileSize: 200 * 1024 * 1024, // 200MB
  },
};

@ApiTags('文件上传')
@ApiBearerAuth()
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @ApiOperation({ summary: '通用上传（单文件/多文件）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '通过 files 字段上传文件，支持单个或多个，dir 为逻辑目录',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: '上传的文件，单文件也使用 files 字段',
        },
        dir: { type: 'string', description: '逻辑目录（可选）' },
        entityType: { type: 'string', description: '可选：关联的实体类型' },
        entityId: { type: 'number', description: '可选：关联的实体 ID' },
        usage: { type: 'string', description: '可选：文件用途标签' },
      },
      required: ['files'],
    },
  })
  @ApiOkResponse({ type: UploadFilesResponseDto })
  @UseInterceptors(FilesInterceptor('files', 20, uploadMulterOptions))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadRequestDto,
    @CurrentUser('userId') userId: number,
    @Req() req: Request,
  ): Promise<UploadFilesResponseDto> {
    const storedDir = req.__uploadDir as string | undefined;
    const dir = sanitizeDir(dto.dir ?? getDirFromRequest(req) ?? storedDir);

    const uploaded = await this.uploadService.saveFiles(files, {
      ...dto,
      dir,
      uploaderId: userId,
    });

    return { files: uploaded };
  }
}
