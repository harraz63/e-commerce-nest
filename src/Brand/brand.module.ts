import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BrandRepository } from 'src/DB/Repositories';
import { BrandModel, UserModel } from 'src/DB/Models';

@Module({
  imports: [BrandModel, UserModel],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository],
  exports: [],
})
export class BrandModule {}
