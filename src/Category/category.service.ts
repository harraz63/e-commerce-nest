import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { S3ClientService } from 'src/Common';
import { UserType } from 'src/DB/Models';
import { BrandRepository, CategotyRepository } from 'src/DB/Repositories';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepo: CategotyRepository,
    private readonly s3Client: S3ClientService,
    private readonly brandRepo: BrandRepository,
  ) {}

  // Add Category
  async addCategory(
    name: string,
    brands: Types.ObjectId[],
    user: Partial<UserType>,
    file: Express.Multer.File,
  ) {
    const { _id } = user;

    // Check If The Category Already Exists
    const isCategoryExists = await this.categoryRepo.findCategoryByName(name);
    if (isCategoryExists)
      throw new BadRequestException('Category already exists');

    // Upload The Logo To S3
    let logoKey, logoUrl;
    if (file) {
      const { key, url } = await this.s3Client.uploadFileOnS3(
        file,
        `${_id as unknown as string}/Categories`,
      );
      logoKey = key;
      logoUrl = url;
    }

    // Check If The Brands Already Exists
    if (brands?.length) {
      const isBrandsExists = await this.brandRepo.findDocuments({
        _id: { $in: brands },
      });
      if (isBrandsExists.length !== brands.length)
        throw new BadRequestException('Some brands do not exist');
    }

    // Create The Category
    const category = await this.categoryRepo.createDocument({
      name: name.toLowerCase(),
      brands: brands,
      logo: logoUrl,
      createdBy: _id,
    });

    return { category, logoUrl, logoKey };
  }
}
