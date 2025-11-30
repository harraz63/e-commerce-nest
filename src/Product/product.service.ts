import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './product.dto';
import { UserType } from 'src/DB/Models';
import { BrandRepository, CategotyRepository } from 'src/DB/Repositories';
import { ProductRepository } from 'src/DB/Repositories/product.repository';
import { pagination, S3ClientService } from 'src/Common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import Redis from 'ioredis';

@Injectable()
export class ProductService {
  private redis = new Redis('redis://localhost:6379');
  constructor(
    private readonly categoryRepo: CategotyRepository,
    private readonly brandRepo: BrandRepository,
    private readonly productRepo: ProductRepository,
    private readonly s3ClientService: S3ClientService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // Add Product
  async addProduct(
    body: CreateProductDto,
    user: Partial<UserType>,
    files: Express.Multer.File[],
  ) {
    const { categoryId, brandId, ...rest } = body;

    const categoryData = await this.categoryRepo.findCategoryById(
      categoryId,
      {},
      { populate: { path: 'brands', select: 'name slug' } },
    );
    if (!categoryData) throw new BadRequestException('Category not found');

    // Check If The Brand Does Not Belongs To The Category
    const brandData = categoryData?.brands.find(
      ({ _id }) => _id.toString() === brandId.toString(),
    );
    if (!brandData) throw new BadRequestException('Brand not found');

    // If There Are Files (images)
    let images: string[] = [];
    let imagesWithUrls: { url: string; key: string }[] = [];
    if (files?.length) {
      const result = await this.s3ClientService.uploadMultipleFilesOnS3(
        files,
        `${user._id as unknown as string}/Products`,
      );
      images = result.map(({ key }) => key);
      imagesWithUrls = result;
    }

    // Add Product To DB
    const product = await this.productRepo.createDocument({
      category: categoryId,
      brand: brandId,
      createdBy: user._id,
      images,
      ...rest,
    });

    const returnObject: object = { product };
    if (imagesWithUrls.length) returnObject['imagesWithUrls'] = imagesWithUrls;

    return returnObject;
  }

  // List All Products
  async listProducts({ limit, page }) {
    // Apply Pagination Concept
    const { limit: currentLimit } = pagination({
      limit: Number(limit),
      page: Number(page),
    });

    const cacheKey = `products:page:${page}:limit:${currentLimit}`;

    const products = await this.cacheManager.get(cacheKey);

    if (!products) {
      // Get Products From DB And Set It In Cache
      const dbProducts = await this.productRepo.findDocuments(
        {},
        {},
        { limit: currentLimit, page: Number(page) },
      );
      await this.cacheManager.set(cacheKey, dbProducts, 30 * 60 * 1000);
      console.log('Products from DB');
      return dbProducts;
    }

    console.log('Products from cache');

    return products;
  }
}
