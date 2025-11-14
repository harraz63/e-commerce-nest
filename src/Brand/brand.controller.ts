import { Body, Controller, Get, Post } from '@nestjs/common';
import { BrandService } from './brand.service';
import { Auth, AuthUser, RolesEnum } from 'src/Common';
import { UserType } from 'src/DB/Models';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('add-brand')  
  @Auth([RolesEnum.ADMIN])
  async addBrand(@Body() body: object, @AuthUser() user: Partial<UserType>) {
    return await this.brandService.addBrand(body, user);
  }
}
