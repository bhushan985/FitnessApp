import { Schema, model, Document, Types } from 'mongoose';

export interface IWeeklyDietSchedule {
  monday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  tuesday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  wednesday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  thursday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  friday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  saturday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  sunday: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
}

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'low' | 'moderate' | 'high';
  fitnessGoal: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'maintenance';
  targetWeightKg: number;
  dietType: 'veg' | 'non_veg' | 'eggetarian' | 'vegan';
  weeklyDietSchedule?: IWeeklyDietSchedule;
  allergies: string[];
  foodPreferences: string[];
  foodDislikes: string[];
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  regionId: Types.ObjectId;
  currentLatitude?: number;
  currentLongitude?: number;
  locationAccuracy?: number;
  locationUpdatedAt?: Date;
  locationPermissionStatus?: 'granted' | 'denied' | 'prompt';
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    city?: string;
    state?: string;
    country?: string;
    regionId?: Types.ObjectId;
    source?: 'gps' | 'manual';
    updatedAt?: Date;
  };
  healthConditions?: string[];
  customGoal?: string;
  healthIntegration?: {
    appleHealthConnected?: boolean;
    healthConnectConnected?: boolean;
    lastSyncedAt?: Date;
  };
  dailyFoodBudget?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    heightCm: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    activityLevel: { type: String, enum: ['low', 'moderate', 'high'], required: true },
    fitnessGoal: { type: String, enum: ['weight_loss', 'weight_gain', 'muscle_building', 'maintenance'], required: true },
    targetWeightKg: { type: Number, required: true },
    dietType: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], required: true },
    weeklyDietSchedule: {
      monday: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], default: 'veg' },
      tuesday: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], default: 'non_veg' },
      wednesday: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], default: 'non_veg' },
      thursday: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], default: 'veg' },
      friday: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], default: 'non_veg' },
      saturday: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], default: 'veg' },
      sunday: { type: String, enum: ['veg', 'non_veg', 'eggetarian', 'vegan'], default: 'non_veg' },
    },
    allergies: [{ type: String }],
    foodPreferences: [{ type: String }],
    foodDislikes: [{ type: String }],
    dailyCalorieTarget: { type: Number, default: 2000 },
    dailyProteinTarget: { type: Number, default: 120 },
    dailyCarbsTarget: { type: Number, default: 225 },
    dailyFatTarget: { type: Number, default: 65 },
    regionId: { type: Schema.Types.ObjectId, ref: 'Region', required: true, index: true },
    currentLatitude: { type: Number },
    currentLongitude: { type: Number },
    locationAccuracy: { type: Number },
    locationUpdatedAt: { type: Date },
    locationPermissionStatus: { type: String, enum: ['granted', 'denied', 'prompt'], default: 'prompt' },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      regionId: { type: Schema.Types.ObjectId, ref: 'Region' },
      source: { type: String, enum: ['gps', 'manual'], default: 'gps' },
      updatedAt: { type: Date, default: Date.now },
    },
    healthConditions: [{ type: String }],
    customGoal: { type: String, default: '' },
    healthIntegration: {
      appleHealthConnected: { type: Boolean, default: false },
      healthConnectConnected: { type: Boolean, default: false },
      lastSyncedAt: { type: Date },
    },
    dailyFoodBudget: { type: String, default: '150-250' },
  },
  { timestamps: true }
);

export const UserProfile = model<IUserProfile>('UserProfile', UserProfileSchema);
