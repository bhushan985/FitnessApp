import { Schema, model, Document, Types } from 'mongoose';

export interface IMealPlan extends Document {
  userId: Types.ObjectId;
  date: Date;
  regionId: Types.ObjectId;
  dietType: string;
  fitnessGoal: string;
  targetCalories: number;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  status: 'generated' | 'accepted' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    regionId: { type: Schema.Types.ObjectId, ref: 'Region', required: true },
    dietType: { type: String, required: true },
    fitnessGoal: { type: String, required: true },
    targetCalories: { type: Number, required: true },
    totalCalories: { type: Number, required: true },
    totalProteinG: { type: Number, required: true },
    totalCarbsG: { type: Number, required: true },
    totalFatG: { type: Number, required: true },
    status: { type: String, enum: ['generated', 'accepted', 'completed'], default: 'generated' },
  },
  { timestamps: true }
);

MealPlanSchema.index({ userId: 1, date: 1 });

export const MealPlan = model<IMealPlan>('MealPlan', MealPlanSchema);
