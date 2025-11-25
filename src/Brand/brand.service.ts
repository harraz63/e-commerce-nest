import { BadGatewayException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { S3ClientService } from 'src/Common';
import { UserType } from 'src/DB/Models';
import { BrandRepository } from 'src/DB/Repositories';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepo: BrandRepository,
    private readonly s3ClientService: S3ClientService,
  ) {}

  // Add Brand
  async addBrand(body, user: Partial<UserType>, file: Express.Multer.File) {
    const { name } = body;

    // Check If The Brand Name Is Already Exist
    const isNameExist = await this.brandRepo.findOne({
      name: name.toLowerCase(),
    });
    if (isNameExist) throw new BadGatewayException('Brand is already exist');

    // Check If There Are A File
    let logoKey, logoUrl;
    if (file) {
      const { key, url } = await this.s3ClientService.uploadFileOnS3(
        file,
        `${user._id as unknown as string}/Brands`,
      );
      logoKey = key;
      logoUrl = url;
    }

    // Createing The Brand
    const brand = await this.brandRepo.createDocument({
      name: name.toLowerCase(),
      createdBy: user._id,
      logo: logoKey,
    });

    return { brand, logoKey, logoUrl };
  }
}
