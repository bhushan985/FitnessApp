import { Schema, model, Document, Types } from 'mongoose';

export interface IFoodRegion extends Document {
  foodId: Types.ObjectId;
  regionId: Types.ObjectId;
  availabilityScore: number; // 1-10
  popularityScore: number; // 1-10
  seasonality: 'all_year' | 'summer' | 'winter' | 'monsoon';
  localName: string;
  averagePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FoodRegionSchema = new Schema<IFoodRegion>(
  {
    foodId: { type: Schema.Types.ObjectId, ref: 'Food', required: true, index: true },
    regionId: { type: Schema.Types.ObjectId, ref: 'Region', required: true, index: true },
    availabilityScore: { type: Number, default: 8, min: 1, max: 10 },
    popularityScore: { type: Number, default: 8, min: 1, max: 10 },
    seasonality: { type: String, enum: ['all_year', 'summer', 'winter', 'monsoon'], default: 'all_year' },
    localName: { type: String, default: '' },
    averagePrice: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FoodRegionSchema.index({ foodId: 1, regionId: 1 }, { unique: true });

export const FoodRegion = model<IFoodRegion>('FoodRegion', FoodRegionSchema);
