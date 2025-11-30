import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth, AuthUser, RolesEnum } from 'src/Common';
import { UserType } from 'src/DB/Models';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Add To Cart
  @Post('add-to-cart')
  @Auth([RolesEnum.USER])
  addTocart(
    @Body() body: { productId: string; quantity: number },
    @AuthUser() user: Partial<UserType>,
  ) {
    return this.cartService.addToCart({ body, user });
  }

  // Remove From Cart
  @Delete('remove-from-cart')
  @Auth([RolesEnum.USER])
  removeFromCart(
    @Body() body: { productId: string },
    @AuthUser() user: Partial<UserType>,
  ) {
    return this.cartService.removeFromCart({ productId: body.productId, user });
  }

  // Get Cart Details
  @Get('get-cart')
  @Auth([RolesEnum.USER])
  getCart(@AuthUser() user: Partial<UserType>) {
    return this.cartService.getCarts(user);
  }
}
