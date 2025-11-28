import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Auth, AuthUser, multerConfig, RolesEnum } from 'src/Common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './product.dto';
import { UserType } from 'src/DB/Models';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Add Product Endpoint
  @Post('add')
  @Auth([RolesEnum.ADMIN])
  @UseInterceptors(FilesInterceptor('images', 4, multerConfig))
  addProduct(
    @Body() body: CreateProductDto,
    @AuthUser() user: Partial<UserType>,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.addProduct(body, user, files);
  }

  // List Products
  @Get('list')
  listProducts(@Query() queryData: { limit: string; page: string }) {
    return this.productService.listProducts(queryData);
  }
}
