import { Test, TestingModule } from '@nestjs/testing';
import { ReturnsService } from './returns.service';
import { PrismaService } from '../prisma.service';
import { ProductAuditService } from '../products/product-audit.service';
import { SalesService } from './sales.service';
import { NotFoundException } from '@nestjs/common';

describe('ReturnsService', () => {
  let service: ReturnsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockProductAuditService = {};
  const mockSalesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ProductAuditService, useValue: mockProductAuditService },
        { provide: SalesService, useValue: mockSalesService },
      ],
    }).compile();

    service = module.get<ReturnsService>(ReturnsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isDefectiveProduct', () => {
    it('should return true if product barcode ends with _DEF', async () => {
      const product = {
        id: 1,
        barcode: '123_DEF',
        category: { name: 'Electronics' },
      };
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      const result = await service.isDefectiveProduct(1);
      expect(result).toBe(true);
    });

    it('should return true if product category is Defective', async () => {
      const product = {
        id: 1,
        barcode: '123',
        category: { name: 'Defective' },
      };
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      const result = await service.isDefectiveProduct(1);
      expect(result).toBe(true);
    });

    it('should return false if product is neither defective by barcode nor category', async () => {
      const product = {
        id: 1,
        barcode: '123',
        category: { name: 'Electronics' },
      };
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      const result = await service.isDefectiveProduct(1);
      expect(result).toBe(false);
    });
  });

  describe('checkDefectiveProduct', () => {
    it('should look for a barcode with _DEF suffix', async () => {
      const originalProduct = {
        id: 1,
        barcode: 'BARCODE123',
        nameAr: 'Test',
        priceRetail: 10,
        priceWholesale: 8,
      };
      const defectiveCategory = { id: 100, name: 'Defective' };
      const defectiveProduct = {
        id: 2,
        barcode: 'BARCODE123_DEF',
        categoryId: 100,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(originalProduct);
      mockPrismaService.category.findFirst.mockResolvedValue(defectiveCategory);
      mockPrismaService.product.findFirst.mockResolvedValue(defectiveProduct);

      const result = await service.checkDefectiveProduct(1);

      expect(mockPrismaService.product.findFirst).toHaveBeenCalledWith({
        where: {
          barcode: 'BARCODE123_DEF',
          categoryId: 100,
        },
      });
      expect(result.exists).toBe(true);
    });
  });
});
