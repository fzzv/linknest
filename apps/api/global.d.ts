declare namespace Express {
  interface Multer {
    File: Express.Multer.File;
  }
  interface Request {
    __uploadDir?: string;
  }
}
