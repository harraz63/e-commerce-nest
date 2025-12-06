import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
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

  // Update Cart Quantity
  @Put('update-cart-quantity')
  @Auth([RolesEnum.USER])
  updateCartQuantity(
    @Body() body: { productId: string; quantity: number },
    @AuthUser() user: Partial<UserType>,
  ) {
    return this.cartService.updateCartQuantity({
      productId: body.productId,
      quantity: body.quantity,
      user,
    });
  }

  // Clear Cart
  @Delete('clear-cart')
  @Auth([RolesEnum.USER])
  clearCart(@AuthUser() user: Partial<UserType>) {
    return this.cartService.clearCart(user);
  }

  // Get Cart Details
  @Get('get-cart-details')
  @Auth([RolesEnum.USER])
  getCartDetails(@AuthUser() user: Partial<UserType>) {
    return this.cartService.getCartDetails(user);
  }
}
