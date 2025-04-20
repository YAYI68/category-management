import { IsNumber, IsOptional, IsString } from "class-validator";


export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;
    @IsOptional()
    @IsNumber()
    parentId?: number;
  }
