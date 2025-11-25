import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  overview: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  @IsOptional()
  brandId: Types.ObjectId;
}
