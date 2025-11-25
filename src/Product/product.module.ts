import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BrandRepository, CategotyRepository } from 'src/DB/Repositories';
import { BrandModel, CategoryModel, ProductModel } from 'src/DB/Models';
import { ProductRepository } from 'src/DB/Repositories/product.repository';
import { S3ClientService } from 'src/Common';

@Module({
  imports: [CategoryModel, BrandModel, ProductModel],
  controllers: [ProductController],
  providers: [
    ProductService,
    CategotyRepository,
    BrandRepository,
    ProductRepository,
    S3ClientService,
  ],
})
export class ProductModule {}
