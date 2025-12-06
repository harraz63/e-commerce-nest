// src/DB/Repositories/base.repository.ts
import mongoose, { AnyObject, DeleteResult, FilterQuery, HydratedDocument, Model, MongooseBaseQueryOptions, MongooseUpdateQueryOptions, ProjectionType, QueryOptions, UpdateQuery, UpdateResult } from 'mongoose';

export class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async createDocument(document: Partial<T>): Promise<T> {
    return this.model.create(document);
  }

  async findDocuments(
    filters: FilterQuery<T>,
    project?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T[]> {
    return this.model.find(filters, project, options);
  }

  async findOne(
    filters: FilterQuery<T>,
    project?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOne(filters, project, options);
  }

  async deleteByIdDocument(
    id: mongoose.Types.ObjectId | string,
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteOneDocument(
    filters: FilterQuery<T>,
    options?: (MongooseBaseQueryOptions<T> & AnyObject) | null,
  ): Promise<DeleteResult> {
    return await this.model.deleteOne(filters, options);
  }

  async deleteMultipleDocuments(
    filters: FilterQuery<T>,
    options?: (MongooseBaseQueryOptions<T> & AnyObject) | null,
  ): Promise<DeleteResult> {
    return await this.model.deleteMany(filters, options);
  }

  async updateOneDocument(
    filters: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findOneAndUpdate(filters, update, options);
  }

  async updateManyDocuments(
    filters: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: MongooseUpdateQueryOptions<T>,
  ): Promise<UpdateResult> {
    return await this.model.updateMany(filters, update, options);
  }

  // ✅ findByIdAndUpdateDocument
  async findByIdAndUpdateDocument(
    id: mongoose.Types.ObjectId | string,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findByIdAndUpdate(id, update, options);
  }

  // ✅ findAndDeleteDocument
  async findAndDeleteDocument(
    filters: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findOneAndDelete(filters, options);
  }

  // ✅ findByIdAndDeleteDocument
  async findByIdAndDeleteDocument(
    id: mongoose.Types.ObjectId | string,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findByIdAndDelete(id, options);
  }
}
