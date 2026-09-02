import { Schema, model, Document, Types } from 'mongoose';

export interface ITrainer extends Document {
  userId: Types.ObjectId;
  name: string;
  profileImage: string;
  bio: string;
  specialization: string[];
  certifications: string[];
  experienceYears: number;
  languages: string[];
  location: string;
  availability: string;
  hourlyRate: number;
  monthlyRate: number;
  rating: number;
  status: 'active' | 'inactive' | 'busy';
  createdAt: Date;
  updatedAt: Date;
}

const TrainerSchema = new Schema<ITrainer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    name: { type: String, required: true },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    specialization: [{ type: String }],
    certifications: [{ type: String }],
    experienceYears: { type: Number, default: 3 },
    languages: [{ type: String }],
    location: { type: String, default: 'Online / Multi-Region' },
    availability: { type: String, default: 'Mon-Fri 8AM - 8PM IST' },
    hourlyRate: { type: Number, default: 500 },
    monthlyRate: { type: Number, default: 3999 },
    rating: { type: Number, default: 4.9 },
    status: { type: String, enum: ['active', 'inactive', 'busy'], default: 'active', index: true },
  },
  { timestamps: true }
);

export const Trainer = model<ITrainer>('Trainer', TrainerSchema);
