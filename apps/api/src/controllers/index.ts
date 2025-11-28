import { BookmarkController } from 'src/controllers/bookmark.controller';
import { CategoryController } from 'src/controllers/category.controller';
import { LinkController } from 'src/controllers/link.controller';
import { UserController } from 'src/controllers/user.controller';

export const controllers = [
  UserController,
  CategoryController,
  LinkController,
  BookmarkController,
];

export default controllers;
