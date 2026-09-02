import { Schema, model, Document, Types } from 'mongoose';

export interface IRecipeIngredient {
  item: string;
  amount: number;
  unit: string;
  gramsEquivalent: number;
}

export interface IRecipeNutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

export interface IRecipe extends Document {
  name: string;
  slug: string;
  localNames: string[];
  region: string;
  cuisine: string;
  mealType: string[]; // ['breakfast', 'lunch', 'dinner', 'snack']
  dietaryType: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  goalTags: string[];
  servings: number;
  ingredients: IRecipeIngredient[];
  instructions: string[];
  nutritionPerServing: IRecipeNutrition;
  servingOptions: Array<{ unit: string; grams: number }>;
  image: string;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IRecipeIngredient>({
  item: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, required: true },
  gramsEquivalent: { type: Number, required: true },
});

const RecipeNutritionSchema = new Schema<IRecipeNutrition>({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbohydrates: { type: Number, required: true },
  fat: { type: Number, required: true },
  fiber: { type: Number, required: true },
});

const RecipeSchema = new Schema<IRecipe>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    localNames: [{ type: String }],
    region: { type: String, required: true, default: 'Pan-India', index: true },
    cuisine: { type: String, required: true, default: 'Indian', index: true },
    mealType: [{ type: String, index: true }],
    dietaryType: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], default: 'veg', index: true },
    goalTags: [{ type: String }],
    servings: { type: Number, default: 2 },
    ingredients: [IngredientSchema],
    instructions: [{ type: String }],
    nutritionPerServing: { type: RecipeNutritionSchema, required: true },
    servingOptions: [
      {
        unit: { type: String, required: true },
        grams: { type: Number, required: true },
      },
    ],
    image: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

RecipeSchema.index({ name: 'text', cuisine: 'text', region: 'text', goalTags: 'text' });

export const Recipe = model<IRecipe>('Recipe', RecipeSchema);
