import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository, ProductRepository } from 'src/DB/Repositories';
import { CartModel, ProductModel } from 'src/DB/Models';
import { S3ClientService } from 'src/Common';

@Module({
  imports: [ProductModel, CartModel],
  controllers: [CartController],
  providers: [CartService, CartRepository, ProductRepository, S3ClientService],
})
export class CartModule {}
