import { Schema, model, Document, Types } from 'mongoose';

export interface IMealLog extends Document {
  userId: Types.ObjectId;
  foodId: Types.ObjectId;
  mealType: 'breakfast' | 'mid_morning' | 'lunch' | 'evening_snack' | 'dinner';
  quantityG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  consumedAt: Date;
  source: 'recommended' | 'manual' | 'replacement' | 'snap_check';
  createdAt: Date;
  updatedAt: Date;
}

const MealLogSchema = new Schema<IMealLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'],
      required: true,
    },
    quantityG: { type: Number, required: true },
    calories: { type: Number, required: true },
    proteinG: { type: Number, required: true },
    carbsG: { type: Number, required: true },
    fatG: { type: Number, required: true },
    consumedAt: { type: Date, default: Date.now, index: true },
    source: { type: String, enum: ['recommended', 'manual', 'replacement', 'snap_check'], default: 'recommended' },
  },
  { timestamps: true }
);

MealLogSchema.index({ userId: 1, consumedAt: 1 });

export const MealLog = model<IMealLog>('MealLog', MealLogSchema);
