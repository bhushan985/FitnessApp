import { Schema, model, Document, Types } from 'mongoose';

export interface IRecommendationFeedback extends Document {
  userId: Types.ObjectId;
  recommendationId?: Types.ObjectId;
  foodId: Types.ObjectId;
  rating: number; // 1-5
  feedbackType: 'liked' | 'disliked' | 'skipped' | 'consumed';
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationFeedbackSchema = new Schema<IRecommendationFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recommendationId: { type: Schema.Types.ObjectId, ref: 'Recommendation' },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    rating: { type: Number, min: 1, max: 5, default: 4 },
    feedbackType: {
      type: String,
      enum: ['liked', 'disliked', 'skipped', 'consumed'],
      required: true,
    },
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const RecommendationFeedback = model<IRecommendationFeedback>(
  'RecommendationFeedback',
  RecommendationFeedbackSchema
);
