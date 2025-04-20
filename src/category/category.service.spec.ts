import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { DatabaseService } from 'src/database/database.service';

// Mock Prisma service
const mockPrismaService = {
  category: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
};

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: DatabaseService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<DatabaseService>(DatabaseService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const categoryData = { name: 'Test Category' };
      const expectedResult = { id: 1, ...categoryData, parentId: null, createdAt: new Date(), updatedAt: new Date() };
      
      mockPrismaService.category.create.mockResolvedValue(expectedResult);
      
      const result = await service.create(categoryData);
      
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: categoryData,
      });
    });

    it('should create a category with a parent', async () => {
      const categoryData = { name: 'Child Category', parentId: 1 };
      const expectedResult = { id: 2, ...categoryData, createdAt: new Date(), updatedAt: new Date() };
      
      mockPrismaService.category.findUnique.mockResolvedValue({ id: 1, name: 'Parent' });
      mockPrismaService.category.create.mockResolvedValue(expectedResult);
      
      const result = await service.create(categoryData);
      
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: categoryData,
      });
    });

    it('should throw NotFoundException if parent does not exist', async () => {
      const categoryData = { name: 'Child Category', parentId: 999 };
      
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      
      await expect(service.create(categoryData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSubtree', () => {
    it('should return a category with its subtree', async () => {
      const id = 1;
      const expectedResult = {
        id: 1,
        name: 'Parent',
        parentId: null,
        children: [
          {
            id: 2,
            name: 'Child',
            parentId: 1,
            children: [],
          },
        ],
      };
      
      mockPrismaService.category.findUnique.mockResolvedValue(expectedResult);
      
      const result = await service.findSubtree(id);
      
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          children: {
            include: {
              children: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const id = 999;
      
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      
      await expect(service.findSubtree(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const id = 1;
      const category = { id, name: 'Test Category' };
      
      mockPrismaService.category.findUnique.mockResolvedValue(category);
      mockPrismaService.category.delete.mockResolvedValue(category);
      
      const result = await service.remove(id);
      
      expect(result).toEqual(category);
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const id = 999;
      
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('move', () => {
    it('should move a category to a new parent', async () => {
      const id = 2;
      const targetParentId = 3;
      const category = { id, name: 'Test Category', parentId: 1 };
      const targetParent = { id: targetParentId, name: 'New Parent', parentId: null };
      const updatedCategory = { ...category, parentId: targetParentId };
      
      mockPrismaService.category.findUnique.mockImplementation((args) => {
        if (args.where.id === id) return Promise.resolve(category);
        if (args.where.id === targetParentId) return Promise.resolve(targetParent);
        return Promise.resolve(null);
      });
      
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);
      
      const result = await service.move(id, { targetParentId });
      
      expect(result).toEqual(updatedCategory);
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id },
        data: { parentId: targetParentId },
      });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const id = 999;
      const targetParentId = 1;
      
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      
      await expect(service.move(id, { targetParentId })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if target parent does not exist', async () => {
      const id = 1;
      const targetParentId = 999;
      const category = { id, name: 'Test Category' };
      
      mockPrismaService.category.findUnique.mockImplementation((args) => {
        if (args.where.id === id) return Promise.resolve(category);
        return Promise.resolve(null);
      });
      
      await expect(service.move(id, { targetParentId })).rejects.toThrow(NotFoundException);
    });
  });
});