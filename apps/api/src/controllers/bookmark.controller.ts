import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { ImportBookmarksDto, ImportBookmarksResultDto } from 'src/dtos';
import { BookmarkImportService } from 'src/services/bookmark-import.service';

@ApiTags('书签')
@ApiBearerAuth()
@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkImportService: BookmarkImportService) {}

  @Post('import')
  @ApiOperation({ summary: '导入 Chrome 书签 HTML 文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传 Chrome 书签文件（file）或直接传递 html 字符串',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: '书签 HTML 文件' },
        html: { type: 'string', description: '书签 HTML 内容' },
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
    const html = file?.buffer?.toString('utf-8') ?? dto?.html;
    if (!html) {
      throw new BadRequestException('请上传书签文件或提供符合要求的 html 内容');
    }
    return this.bookmarkImportService.importFromHtml(userId, html);
  }
}
