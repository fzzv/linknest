import { BookmarkController } from 'src/controllers/bookmark.controller';
import { CategoryController } from 'src/controllers/category.controller';
import { LinkController } from 'src/controllers/link.controller';
import { UserController } from 'src/controllers/user.controller';
import { UploadController } from 'src/controllers/upload.controller';
import { DiscoverController } from 'src/controllers/discover.controller';

export const controllers = [
  UserController,
  CategoryController,
  LinkController,
  BookmarkController,
  UploadController,
  DiscoverController,
];

export default controllers;
