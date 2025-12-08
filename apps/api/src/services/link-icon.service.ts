import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, posix } from 'node:path';

@Injectable()
export class LinkIconService {
  private readonly maxSize = 2 * 1024 * 1024; // 2MB

  async upload(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传图片文件');
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('仅支持图片文件');
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException('图片大小不能超过 2MB');
    }

    const hash = createHash('md5').update(file.buffer).digest('hex');
    const extension = this.getExtensionFromMime(file.mimetype);
    const filename = `${hash}.${extension}`;
    const dir = this.getIconDir();
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, filename);

    try {
      await writeFile(filePath, file.buffer, { flag: 'wx' });
    } catch (error) {
      const writeError = error as NodeJS.ErrnoException;
      if (writeError.code !== 'EEXIST') {
        throw error;
      }
    }

    return { url: posix.join('/uploads', 'linkicons', filename) };
  }

  private getIconDir() {
    return join(__dirname, '..', '..', 'uploads', 'linkicons');
  }

  private getExtensionFromMime(mime: string) {
    const normalized = mime.toLowerCase();
    const mimeMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/x-icon': 'ico',
      'image/vnd.microsoft.icon': 'ico',
      'image/webp': 'webp',
      'image/avif': 'avif',
    };
    return mimeMap[normalized] ?? 'png';
  }
}
