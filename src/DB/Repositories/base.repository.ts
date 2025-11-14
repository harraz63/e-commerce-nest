// src/DB/Repositories/base.repository.ts
import { FilterQuery, Model, ProjectionType } from 'mongoose';

export class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async createDocument(document: Partial<T>): Promise<T> {
    return this.model.create(document);
  }

  async findDocuments(
    filters: FilterQuery<T>,
    project?: ProjectionType<T>,
  ): Promise<T[]> {
    return this.model.find(filters, project);
  }

  async findOne(
    filters: FilterQuery<T>,
    project?: ProjectionType<T>,
  ): Promise<T | null> {
    return this.model.findOne(filters, project);
  }
}