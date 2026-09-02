import { Schema, model, Document, Types } from 'mongoose';

export interface IDetectedFoodItem {
  foodId?: Types.ObjectId;
  foodName: string;
  confidence: number;
  estimatedQuantityG: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
}

export interface ISnapCheckResult extends Document {
  userId: Types.ObjectId;
  imageUrl: string;
  detectedItems: IDetectedFoodItem[];
  estimatedNutrition: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  correctedItems?: IDetectedFoodItem[];
  finalNutrition?: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  status: 'analyzed' | 'corrected' | 'logged';
  createdAt: Date;
  updatedAt: Date;
}

const DetectedFoodItemSchema = new Schema<IDetectedFoodItem>({
  foodId: { type: Schema.Types.ObjectId, ref: 'Food' },
  foodName: { type: String, required: true },
  confidence: { type: Number, required: true, default: 0.8 },
  estimatedQuantityG: { type: Number, required: true, default: 100 },
  unit: { type: String, default: 'g' },
  calories: { type: Number, required: true, default: 0 },
  proteinG: { type: Number, required: true, default: 0 },
  carbsG: { type: Number, required: true, default: 0 },
  fatG: { type: Number, required: true, default: 0 },
  fiberG: { type: Number, default: 0 },
});

const SnapCheckResultSchema = new Schema<ISnapCheckResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    imageUrl: { type: String, required: true },
    detectedItems: [DetectedFoodItemSchema],
    estimatedNutrition: {
      calories: { type: Number, required: true },
      proteinG: { type: Number, required: true },
      carbsG: { type: Number, required: true },
      fatG: { type: Number, required: true },
      fiberG: { type: Number, default: 0 },
    },
    correctedItems: [DetectedFoodItemSchema],
    finalNutrition: {
      calories: { type: Number },
      proteinG: { type: Number },
      carbsG: { type: Number },
      fatG: { type: Number },
      fiberG: { type: Number },
    },
    status: {
      type: String,
      enum: ['analyzed', 'corrected', 'logged'],
      default: 'analyzed',
    },
  },
  { timestamps: true }
);

export const SnapCheckResult = model<ISnapCheckResult>('SnapCheckResult', SnapCheckResultSchema);
