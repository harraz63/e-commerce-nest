import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { paymentMethodEnum } from 'src/Common';

export class CreateOrderBodyDto {
  @IsMongoId({ message: 'Invalid cart ID format.' })
  @IsNotEmpty({ message: 'Cart ID is required.' })
  cartId: string;

  @IsString({ message: 'Address must be a string.' })
  @IsNotEmpty({ message: 'Address is required.' })
  address: string;

  @IsString({ message: 'Phone number must be a string.' })
  @IsNotEmpty({ message: 'Phone number is required.' })
  phone: string;

  @IsEnum(paymentMethodEnum, {
    message: 'Payment method must be one of the supported methods.',
  })
  paymentMethod: paymentMethodEnum;
}
