import { Injectable } from '@nestjs/common';
import { Order, OrderType } from '../Models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';

@Injectable()
export class OrderRepository extends BaseRepository<OrderType> {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderType>,
  ) {
    super(orderModel);
  }

  // Create Order
  async createOrder (orderData) {
    return await this.orderModel.create(orderData)
  }
}
