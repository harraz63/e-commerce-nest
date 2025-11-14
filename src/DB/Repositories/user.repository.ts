import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { User, UserType } from '../Models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, ProjectionType, Types } from 'mongoose';

@Injectable()
export class UserRepository extends BaseRepository<UserType> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserType>,
  ) {
    super(userModel);
  }

  // Find One Document
  async findOneDocument(
    filters: FilterQuery<UserType>,
    project?: ProjectionType<UserType>,
  ): Promise<UserType | null> {
    return await this.userModel.findOne(filters, project);
  }

  // Find User By ID
  async findUserById(
    id: Types.ObjectId,
    project?: ProjectionType<UserType>,
  ): Promise<UserType | null> {
    return await this.userModel.findOne({ _id: id }, project);
  }

  // Find User By Email
  async findUserByEmail(
    email: string,
    project?: ProjectionType<UserType>,
  ): Promise<UserType | null> {
    return await this.userModel.findOne({ email }, project);
  }

  // Find User By Phone
  async findUserByPhone(
    phone: string,
    project?: ProjectionType<UserType>,
  ): Promise<UserType | null> {
    return await this.userModel.findOne({ phone }, project);
  }
}
