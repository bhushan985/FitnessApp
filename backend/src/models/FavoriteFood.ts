import { Schema, model, Document, Types } from 'mongoose';

export interface IFavoriteFood extends Document {
  userId: Types.ObjectId;
  foodId?: Types.ObjectId;
  foodName: string;
  defaultQuantity: number;
  defaultUnit: string;
  defaultGrams: number;
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteFoodSchema = new Schema<IFavoriteFood>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food' },
    foodName: { type: String, required: true },
    defaultQuantity: { type: Number, default: 1 },
    defaultUnit: { type: String, default: 'grams' },
    defaultGrams: { type: Number, default: 100 },
    nutrition: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbohydrates: { type: Number, required: true },
      fat: { type: Number, required: true },
      fiber: { type: Number, required: true },
    },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

FavoriteFoodSchema.index({ userId: 1, foodName: 1 }, { unique: true });

export const FavoriteFood = model<IFavoriteFood>('FavoriteFood', FavoriteFoodSchema);
