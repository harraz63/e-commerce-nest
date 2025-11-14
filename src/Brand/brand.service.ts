import { BadGatewayException, Injectable } from '@nestjs/common';
import { UserType } from 'src/DB/Models';
import { BrandRepository } from 'src/DB/Repositories';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepository) {}

  // Add Brand
  async addBrand(body, user: Partial<UserType>) {
    const { name } = body;

    // Check If The Brand Name Is Already Exist
    const isNameExist = await this.brandRepo.findOne({
      name: name.toLowerCase(),
    });
    if (isNameExist) throw new BadGatewayException('Brand is already exist');

    // Createing The Brand
    const brand = await this.brandRepo.createDocument({
      name: name.toLowerCase(),
      createdBy: user._id,
    });

    return brand;
  }
}
