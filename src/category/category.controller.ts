import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { CreateCategoryDto, MoveCategoryDto } from './dto/create-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoryService } from './category.service';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoriesService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'The category has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 404, description: 'Parent category not found.' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subtree by providing a parent node ID' })
  @ApiParam({ name: 'id', description: 'ID of the parent category' })
  @ApiResponse({ status: 200, description: 'The subtree has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Parent category not found.' })
  findSubtree(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findSubtree(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a category' })
  @ApiParam({ name: 'id', description: 'ID of the category to delete' })
  @ApiResponse({ status: 200, description: 'The category has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a subtree from one parent to another' })
  @ApiParam({ name: 'id', description: 'ID of the category to move' })
  @ApiResponse({ status: 200, description: 'The category has been successfully moved.' })
  @ApiResponse({ status: 404, description: 'Category or target parent not found.' })
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveCategoryDto: MoveCategoryDto,
  ) {
    return this.categoriesService.move(id, moveCategoryDto);
  }
}
