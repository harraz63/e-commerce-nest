import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductType } from '../Models';
import { BaseRepository } from './base.repository';
import { Model, Types, FilterQuery } from 'mongoose';

@Injectable()
export class ProductRepository extends BaseRepository<ProductType> {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductType>,
  ) {
    super(productModel);
  }

  // Find Product By ID
  async findProductById(id: Types.ObjectId) {
    return this.productModel.findOne({ _id: id });
  }
}
