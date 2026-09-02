import { Schema, model, Document } from 'mongoose';

export interface IRegion extends Document {
  country: string;
  state: string;
  city: string;
  regionName: string;
  timezone: string;
  centerLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RegionSchema = new Schema<IRegion>(
  {
    country: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    regionName: { type: String, required: true, index: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    centerLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [73.8567, 18.5204] }, // Default Pune coordinates [lng, lat]
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

RegionSchema.index({ country: 1, state: 1, city: 1, regionName: 1 }, { unique: true });
RegionSchema.index({ centerLocation: '2dsphere' });

export const Region = model<IRegion>('Region', RegionSchema);
