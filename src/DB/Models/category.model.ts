import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';

// Class

@Schema()
export class Category {
  @Prop({
    type: String,
    index: { name: 'idx_name_unique', unique: true },
    trim: true,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    index: {
      name: 'idx_slug',
    },
    trim: true,
    lowercase: true,
  })
  slug: string;

  @Prop({ type: String })
  logo: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Brand' }] })
  brands: Types.ObjectId[];
}

// Schema
export const categorySchema = SchemaFactory.createForClass(Category);

// Model
export const CategoryModel = MongooseModule.forFeatureAsync([
  {
    name: Category.name,
    useFactory: () => {
      const schema = categorySchema;
      schema.pre('save', function () {
        this.slug = slugify(this.name, {
          replacement: '_',
          lower: true,
          trim: true,
        });
      });
      return schema;
    },
  },
]);

// Type
export type CategotyType = HydratedDocument<Category>;
