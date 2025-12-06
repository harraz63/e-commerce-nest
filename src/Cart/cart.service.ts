import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { S3ClientService } from 'src/Common';
import { ProductType, UserType } from 'src/DB/Models';
import { CartRepository } from 'src/DB/Repositories';
import { ProductRepository } from 'src/DB/Repositories/product.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepsitory: ProductRepository,
    private readonly s3Client: S3ClientService,
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

    // 1. Check product exists
    const product = await this.productRepsitory.findProductById(
      productId as Types.ObjectId,
    );
    if (!product) throw new NotFoundException('Product not found');

    // 2. Get the cart with that product
    const cart = await this.cartRepository.findOne({
      userId,
      'products.id': productId,
    });
    if (!cart || !cart.products?.length)
      throw new NotFoundException('Cart is empty or wrong productId');

    // 3. Remove the product from products[]
    cart.products = cart.products.filter(
      (p) => p.id.toString() !== productId.toString(),
    );

    // 4. Recalculate subtotal
    cart.subtotal = cart.products.reduce(
      (acc, item) => acc + item.finalPrice * item.quantity,
      0,
    );

    // 5. Save updated cart
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

  // Update Cart Quantity
  async updateCartQuantity({ productId, quantity, user }) {
    const userId = user._id;

    // Get The Cart
    const cart = await this.cartRepository.findCartByUserId(
      userId as Types.ObjectId,
    );
    if (!cart) throw new NotFoundException('cart not found');

    // Update The Cart Quantity
    let message = 'Product not found in cart';
    cart.products = cart.products.map((product) => {
      if (product.id.equals(productId as Types.ObjectId)) {
        message = 'Product quantity updated successfully';
        return { ...product, quantity };
      } else {
        return product;
      }
    });
    await cart.save();

    console.log(message);

    return { message, cart };
  }

  // Clear Cart
  async clearCart(user: Partial<UserType>) {
    const userId = user._id;

    // Get The Cart
    const cart = await this.cartRepository.findCartByUserId(
      userId as Types.ObjectId,
    );
    if (!cart) throw new NotFoundException('cart not found');

    // Clear The Cart
    cart.products = [];
    cart.subtotal = 0;
    cart.shippingFee = 0;
    cart.VAT = 0;
    await cart.save();

    return cart;
  }

  // Get Cart Details
  async getCartDetails(user: Partial<UserType>) {
    const userId = user._id;

    // Get The Cart
    const cartDoc = await this.cartRepository.findCartByUserId(
      userId as Types.ObjectId,
      {},
      {
        populate: [
          {
            path: 'products.id',
            select:
              'id title finalPrice images stock brand category bestSeller quantity',
          },
        ],
        select: '-__v',
      },
    );

    if (!cartDoc) throw new NotFoundException('Cart not found');

    // Convert to plain object
    const cart = cartDoc.toObject();

    // Add firstImageUrl inside each product.id
    await Promise.all(
      cart.products.map(async (product: any) => {
        const productObj = product.id as ProductType;
        if (productObj.images && productObj.images.length > 0) {
          const imageKey = productObj.images[0];
          const signedUrl = await this.s3Client.getFileWithSignedUrl(imageKey);
          productObj.firstImageUrl = signedUrl;
        } else {
          productObj.firstImageUrl = null;
        }
      }),
    );


    return cart;
  }
}
