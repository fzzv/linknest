import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { Optional } from "../common/validation";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Optional()
  @IsNotEmpty()
  description: string;

  @IsString()
  @Optional()
  @IsNotEmpty()
  icon?: string;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
