import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, QueryOptions, Types } from 'mongoose';
import { Category, CategotyType } from '../Models';

@Injectable()
export class CategotyRepository extends BaseRepository<CategotyType> {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategotyType>,
  ) {
    super(categoryModel);
  }

  // Find Category By Id
  async findCategoryById(
    id: Types.ObjectId,
    project?: ProjectionType<CategotyType>,
    options?: QueryOptions<Category>,
  ): Promise<CategotyType | null> {
    return await this.categoryModel.findOne({ _id: id }, project, options);
  }

  // Find Category By Name
  async findCategoryByName(
    name: string,
    project?: ProjectionType<CategotyType>,
  ): Promise<CategotyType | null> {
    return await this.categoryModel.findOne({ name }, project);
  }
}
