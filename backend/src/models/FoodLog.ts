import { Schema, model, Document, Types } from 'mongoose';

export interface IFoodLogNutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

export interface IFoodLogSource {
  type: 'manual' | 'search' | 'snap' | 'recipe';
  referenceId?: string;
}

export interface IFoodLog extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | 'other';
  foodId?: Types.ObjectId;
  foodName: string;
  quantity: number;
  unit: 'grams' | 'bowl' | 'plate' | 'piece' | 'roti' | 'cup' | 'glass' | 'tbsp' | 'tsp' | 'serving';
  grams: number;
  nutrition: IFoodLogNutrition;
  source: IFoodLogSource;
  imageUrl?: string;
  confidence?: {
    foodConfidence?: number;
    portionConfidence?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FoodLogNutritionSchema = new Schema<IFoodLogNutrition>({
  calories: { type: Number, required: true, default: 0 },
  protein: { type: Number, required: true, default: 0 },
  carbohydrates: { type: Number, required: true, default: 0 },
  fat: { type: Number, required: true, default: 0 },
  fiber: { type: Number, required: true, default: 0 },
});

const FoodLogSourceSchema = new Schema<IFoodLogSource>({
  type: { type: String, enum: ['manual', 'search', 'snap', 'recipe'], default: 'search' },
  referenceId: { type: String, default: '' },
});

const FoodLogSchema = new Schema<IFoodLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'other'],
      required: true,
      default: 'lunch',
    },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food' },
    foodName: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, default: 1 },
    unit: {
      type: String,
      enum: ['grams', 'bowl', 'plate', 'piece', 'roti', 'cup', 'glass', 'tbsp', 'tsp', 'serving'],
      default: 'grams',
    },
    grams: { type: Number, required: true, default: 100 },
    nutrition: { type: FoodLogNutritionSchema, required: true },
    source: { type: FoodLogSourceSchema, required: true },
    imageUrl: { type: String, default: '' },
    confidence: {
      foodConfidence: { type: Number },
      portionConfidence: { type: Number },
    },
  },
  { timestamps: true }
);

FoodLogSchema.index({ userId: 1, date: 1 });

export const FoodLog = model<IFoodLog>('FoodLog', FoodLogSchema);
