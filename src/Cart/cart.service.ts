import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UserType } from 'src/DB/Models';
import { CartRepository } from 'src/DB/Repositories';
import { ProductRepository } from 'src/DB/Repositories/product.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepsitory: ProductRepository,
  ) {}

  // Add To Cart
  async addToCart({ body, user }) {
    const { productId, quantity } = body;
    const userId = user._id;

    // Get The Product And Check About If Is Not Exist
    const product = await this.productRepsitory.findProductById(
      productId as Types.ObjectId,
    );
    if (!product) throw new BadRequestException('Product not found');

    // Get The User Cart
    const cart = await this.cartRepository.findCartByUserId(
      userId as Types.ObjectId,
    );

    // If User Has No Cart -> Create It
    if (!cart) {
      return await this.cartRepository.createDocument({
        userId,
        products: [
          { id: productId, finalPrice: product.finalPrice, quantity: quantity },
        ],
      });
    }

    // Check If The Product Already Added To Cart
    const prouctInCart = cart.products.find((product) =>
      product.id.equals(productId as Types.ObjectId),
    );
    if (prouctInCart)
      throw new BadRequestException('Product already added to cart');

    // If Product Does Not In Cart
    cart.products.push({
      id: productId,
      finalPrice: product.finalPrice,
      quantity,
    });

    await cart.save();

    return cart;
  }

  // Remove From Cart
  async removeFromCart({ productId, user }) {
    const userId = user._id;

    // Get The Product From DB
    const product = await this.productRepsitory.findProductById(
      productId as Types.ObjectId,
    );
    if (!product) throw new NotFoundException('Product not found');

    // Get The User Cart
    const cart = await this.cartRepository.findOne({
      userId,
      'products.id': productId,
    });
    if (!cart || !cart?.products?.length)
      throw new NotFoundException('Cart is empty or wrong cartId');

    await cart.save();

    return cart;
  }

  // Get Cart
  async getCarts(user: Partial<UserType>) {
    const userId = user._id;

    // Get The Cart With Populate
    const cart = await this.cartRepository.findCartByUserId(
      userId as Types.ObjectId,
      {},
      {
        populate: [
          {
            path: 'products.id',
            select: 'title finalPrice images stock',
          },
        ],
      },
    );

    if (!cart) throw new NotFoundException('cart not found');

    return cart;
  }
}
