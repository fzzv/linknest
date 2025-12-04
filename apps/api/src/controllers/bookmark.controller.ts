import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { ImportBookmarksDto, ImportBookmarksResultDto } from 'src/dtos';
import { BookmarkImportService } from 'src/services/bookmark-import.service';
import { I18nService } from 'nestjs-i18n';

@ApiTags('书签')
@ApiBearerAuth()
@Controller('bookmarks')
export class BookmarkController {
  constructor(
    private readonly bookmarkImportService: BookmarkImportService,
    private readonly i18n: I18nService
  ) { }

  @Post('import')
  @ApiOperation({ summary: '导入书签 HTML/JSON 文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传书签 HTML/JSON 文件（file）或直接传递 html/json 字符串',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: '书签 HTML/JSON 文件' },
        html: { type: 'string', description: '书签 HTML 内容' },
        json: { type: 'string', description: '书签 JSON 内容（数组或包含 children 字段的对象）' },
      },
    },
  })
  @ApiOkResponse({ type: ImportBookmarksResultDto })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importBookmarks(
    @CurrentUser('userId') userId: number,
    @UploadedFile() file?: Express.Multer.File,
    @Body() dto?: ImportBookmarksDto,
  ): Promise<ImportBookmarksResultDto> {
    const fileContent = file?.buffer?.toString('utf-8');
    if (fileContent) {
      const trimmed = fileContent.trim();
      const isJsonFile =
        file?.mimetype === 'application/json' ||
        file?.originalname?.toLowerCase().endsWith('.json') ||
        trimmed.startsWith('{') ||
        trimmed.startsWith('[');
      if (isJsonFile) {
        return this.bookmarkImportService.importFromJson(userId, fileContent);
      }
      return this.bookmarkImportService.importFromHtml(userId, fileContent);
    }

    if (dto?.json) {
      return this.bookmarkImportService.importFromJson(userId, dto.json);
    }

    if (dto?.html) {
      return this.bookmarkImportService.importFromHtml(userId, dto.html);
    }

    throw new BadRequestException(this.i18n.t('bookmark.uploadFileError'));
  }
}
