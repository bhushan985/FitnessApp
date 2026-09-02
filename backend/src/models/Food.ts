import { Schema, model, Document } from 'mongoose';

export interface INutrition {
  calories: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
}

export interface IFood extends Document {
  name: string;
  localNames: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage' | 'dessert';
  dietaryType: 'veg' | 'non_veg' | 'egg' | 'vegan';
  servingUnit: string;
  defaultServingSize: number;
  nutrition: INutrition;
  ingredients: string[];
  preparationMethod: string;
  imageUrl: string;
  source: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NutritionSchema = new Schema<INutrition>(
  {
    calories: { type: Number, required: true },
    proteinG: { type: Number, required: true },
    carbohydratesG: { type: Number, required: true },
    fatG: { type: Number, required: true },
    fiberG: { type: Number, default: 0 },
    sugarG: { type: Number, default: 0 },
  },
  { _id: false }
);

const FoodSchema = new Schema<IFood>(
  {
    name: { type: String, required: true, index: true },
    localNames: [{ type: String }],
    category: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage', 'dessert'],
      required: true,
      index: true,
    },
    dietaryType: {
      type: String,
      enum: ['veg', 'non_veg', 'egg', 'vegan'],
      required: true,
      index: true,
    },
    servingUnit: { type: String, default: 'grams' },
    defaultServingSize: { type: Number, default: 100 },
    nutrition: { type: NutritionSchema, required: true },
    ingredients: [{ type: String }],
    preparationMethod: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    source: { type: String, default: 'internal' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Food = model<IFood>('Food', FoodSchema);
