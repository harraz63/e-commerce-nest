import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { Auth, AuthUser, multerConfig, RolesEnum } from 'src/Common';
import { UserType } from 'src/DB/Models';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('add-brand')
  @Auth([RolesEnum.ADMIN])
  @UseInterceptors(FileInterceptor('logo', multerConfig))
  async addBrand(
    @Body() body: object,
    @AuthUser() user: Partial<UserType>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.brandService.addBrand(body, user, file);
  }
}
