import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({
        description:'category name',
        example:'movie'
    })
    @IsString()
    name: string;
    @ApiProperty({
        description:'The parent id',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    parentId?: number;
  }
  

  export class MoveCategoryDto {
    @ApiProperty({
        description:'The target parent id',
        example: 1,
    })
    @IsNumber()
    targetParentId: number;
  }