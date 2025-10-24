import { Injectable } from "@nestjs/common";
import { 
  UserRepository,
  CategoryRepository
} from "@linknest/api";

@Injectable()
export class BaseService {
  constructor(
    protected userRepository: UserRepository,
    protected categoryRepository: CategoryRepository,
  ) {}
}
