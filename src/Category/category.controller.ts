import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Auth, AuthUser, multerConfig, RolesEnum } from 'src/Common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserType } from 'src/DB/Models';
import { Types } from 'mongoose';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Add Category
  @Post('add')
  @Auth([RolesEnum.ADMIN])
  @UseInterceptors(FileInterceptor('logo', multerConfig))
  addCategory(
    @Body('name') name: string,
    @AuthUser() user: Partial<UserType>,
    @Body('brands') brands: Types.ObjectId[],
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.addCategory(name, brands, user, file);
  }

  // List All Categories
  @Get('list')
  listAllCategories() {
    return this.categoryService.listAllCategories();
  }
}
