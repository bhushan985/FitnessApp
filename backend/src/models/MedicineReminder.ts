import { Schema, model, Document, Types } from 'mongoose';

export interface IMedicineReminder extends Document {
  userId: Types.ObjectId;
  name: string;
  dosage: string;
  time: string; // e.g. "08:00 AM" or "20:00"
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
  notes?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  statusByDate: Map<string, 'taken' | 'skipped' | 'pending'>;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineReminderSchema = new Schema<IMedicineReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true },
    frequency: { type: String, enum: ['daily', 'twice_daily', 'weekly', 'as_needed'], default: 'daily' },
    notes: { type: String, default: '' },
    startDate: { type: String },
    endDate: { type: String },
    isActive: { type: Boolean, default: true },
    statusByDate: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

MedicineReminderSchema.index({ userId: 1, isActive: 1 });

export const MedicineReminder = model<IMedicineReminder>('MedicineReminder', MedicineReminderSchema);
