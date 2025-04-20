import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoriesService = {
    create: jest.fn(),
    findSubtree: jest.fn(),
    remove: jest.fn(),
    move: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const categoryDto = { name: 'Test Category' };
      const expected = { id: 1, ...categoryDto, parentId: null, createdAt: new Date(), updatedAt: new Date() };
      
      mockCategoriesService.create.mockResolvedValue(expected);
      
      expect(await controller.create(categoryDto)).toBe(expected);
      expect(service.create).toHaveBeenCalledWith(categoryDto);
    });
  });

  describe('findSubtree', () => {
    it('should return a category subtree', async () => {
      const id = 1;
      const expected = {
        id,
        name: 'Parent',
        children: [{ id: 2, name: 'Child', children: [] }],
      };
      
      mockCategoriesService.findSubtree.mockResolvedValue(expected);
      
      expect(await controller.findSubtree(id)).toBe(expected);
      expect(service.findSubtree).toHaveBeenCalledWith(id);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const id = 1;
      const expected = { id, name: 'Test Category' };
      
      mockCategoriesService.remove.mockResolvedValue(expected);
      
      expect(await controller.remove(id)).toBe(expected);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('move', () => {
    it('should move a category', async () => {
      const id = 1;
      const moveDto = { targetParentId: 2 };
      const expected = { id, name: 'Test Category', parentId: 2 };
      
      mockCategoriesService.move.mockResolvedValue(expected);
      
      expect(await controller.move(id, moveDto)).toBe(expected);
      expect(service.move).toHaveBeenCalledWith(id, moveDto);
    });
  });
});