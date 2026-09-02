import { Schema, model, Document, Types } from 'mongoose';

export interface IMealPlanItem extends Document {
  mealPlanId: Types.ObjectId;
  mealType: 'breakfast' | 'mid_morning' | 'lunch' | 'evening_snack' | 'dinner';
  foodId: Types.ObjectId;
  quantityG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanItemSchema = new Schema<IMealPlanItem>(
  {
    mealPlanId: { type: Schema.Types.ObjectId, ref: 'MealPlan', required: true, index: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'],
      required: true,
    },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    quantityG: { type: Number, required: true },
    calories: { type: Number, required: true },
    proteinG: { type: Number, required: true },
    carbsG: { type: Number, required: true },
    fatG: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MealPlanItem = model<IMealPlanItem>('MealPlanItem', MealPlanItemSchema);
