import { PrismaService } from '@linknest/db';
import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  resolveFilePaths,
  sanitizeDir,
  extractExt,
  randomizeFilename,
  decodeOriginalName,
} from 'src/utils/upload.utils';

interface UploadOptions {
  dir?: string;
  entityType?: string;
  entityId?: number;
  usage?: string;
  uploaderId?: number;
}

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService, private readonly i18n: I18nService) { }

  async saveFiles(files: Express.Multer.File[], options: UploadOptions) {
    if (!files?.length) {
      throw new BadRequestException(this.i18n.t('upload.atLeastOneFile'));
    }

    if ((options.entityType && !options.entityId) || (!options.entityType && options.entityId)) {
      throw new BadRequestException(this.i18n.t('upload.entityTypeAndIdRequired'));
    }

    const dir = sanitizeDir(options.dir);

    const uploads = await Promise.all(
      files.map(async (file) => {
        const originalName = decodeOriginalName(file.originalname);
        const filename = file.filename || randomizeFilename(originalName);
        const ext = extractExt(originalName);
        const { path, url } = resolveFilePaths(dir, filename);

        return this.prisma.file.create({
          data: {
            originalName,
            filename,
            mimeType: file.mimetype || 'application/octet-stream',
            size: file.size,
            ext,
            dir,
            path,
            url,
            uploaderId: options.uploaderId,
            fileAttachments: options.entityType
              ? {
                create: {
                  entityType: options.entityType,
                  entityId: options.entityId!,
                  usage: options.usage,
                },
              }
              : undefined,
          },
        });
      }),
    );

    return uploads;
  }
}
