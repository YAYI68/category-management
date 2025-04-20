import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCategoryDto, MoveCategoryDto } from './dto/create-category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (createCategoryDto.parentId) {
      const parentExists = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });
      
      if (!parentExists) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parentId} not found`);
      }
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findSubtree(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async remove(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  async move(id: number, moveCategoryDto: MoveCategoryDto): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if target parent exists (if not null)
    if (moveCategoryDto.targetParentId) {
      const targetParent = await this.prisma.category.findUnique({
        where: { id: moveCategoryDto.targetParentId },
      });

      if (!targetParent) {
        throw new NotFoundException(`Target parent category with ID ${moveCategoryDto.targetParentId} not found`);
      }

      // Check if moving to a child would create a cycle
      await this.validateNoCycle(id, moveCategoryDto.targetParentId);
    }

    return this.prisma.category.update({
      where: { id },
      data: { parentId: moveCategoryDto.targetParentId },
    });
  }

  // Validate that moving a category doesn't create a cycle
  private async validateNoCycle(sourceId: number, targetParentId: number): Promise<void> {
    let currentId:number|null = targetParentId;
    
    while (currentId !== null) {
      if (currentId === sourceId) {
        throw new Error('Moving this category would create a cycle in the hierarchy.');
      }
      
      const parent = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
      
      if (!parent) break;
      
      currentId = parent.parentId;
    }
  }
}
