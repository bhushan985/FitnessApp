import { Schema, model, Document, Types } from 'mongoose';

export interface IRecommendation extends Document {
  userId: Types.ObjectId;
  foodId: Types.ObjectId;
  mealType: string;
  score: number;
  reasons: string[];
  algorithmVersion: string;
  regionMatch: boolean;
  nutritionMatch: boolean;
  preferenceMatch: boolean;
  goalMatch: boolean;
  availabilityMatch: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    mealType: { type: String, required: true },
    score: { type: Number, required: true },
    reasons: [{ type: String }],
    algorithmVersion: { type: String, default: 'v1.0' },
    regionMatch: { type: Boolean, default: true },
    nutritionMatch: { type: Boolean, default: true },
    preferenceMatch: { type: Boolean, default: true },
    goalMatch: { type: Boolean, default: true },
    availabilityMatch: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Recommendation = model<IRecommendation>('Recommendation', RecommendationSchema);
