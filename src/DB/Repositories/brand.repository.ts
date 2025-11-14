import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandType } from '../Models';

@Injectable()
export class BrandRepository extends BaseRepository<BrandType> {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandType>,
  ) {
    super(brandModel);
  }
}
