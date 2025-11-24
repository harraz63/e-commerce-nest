import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { BrandRepository, CategotyRepository } from 'src/DB/Repositories';
import { CategoryController } from './category.controller';
import { BrandModel, CategoryModel } from 'src/DB/Models';
import { S3ClientService } from 'src/Common';

@Module({
  imports: [CategoryModel, BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService, CategotyRepository, S3ClientService, BrandRepository],
})
export class CategoryModule {}
