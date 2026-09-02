import { Schema, model, Document, Types } from 'mongoose';

export interface ITrainerAssignment extends Document {
  userId: Types.ObjectId;
  trainerId: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  membershipId?: Types.ObjectId;
  status: 'active' | 'expired' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerAssignmentSchema = new Schema<ITrainerAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true, index: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    membershipId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan' },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active', index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

TrainerAssignmentSchema.index({ userId: 1, trainerId: 1, status: 1 });

export const TrainerAssignment = model<ITrainerAssignment>('TrainerAssignment', TrainerAssignmentSchema);
