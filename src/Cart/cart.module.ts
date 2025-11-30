import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository, ProductRepository } from 'src/DB/Repositories';
import { CartModel, ProductModel } from 'src/DB/Models';

@Module({
  imports: [ProductModel, CartModel],
  controllers: [CartController],
  providers: [CartService, CartRepository, ProductRepository],
})
export class OrderModule {}
