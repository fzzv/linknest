import { PrismaService } from "@linknest/db";

export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return {
      message: 'Hello World',
    };
  }
}
