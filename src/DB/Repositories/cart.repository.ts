import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Cart, CartModel, CartType } from '../Models';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, QueryOptions, Types } from 'mongoose';

@Injectable()
export class CartRepository extends BaseRepository<CartType> {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartType>,
  ) {
    super(cartModel);
  }

  // Find Cart By User ID
  async findCartByUserId(
    id: Types.ObjectId,
    project?: ProjectionType<CartType>,
    options?: QueryOptions<CartType>,
  ) {
    return this.cartModel.findOne({ userId: id }, project, options);
  }
}
