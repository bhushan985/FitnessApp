import { AuditLog } from '../models/AuditLog.js';
import { Types } from 'mongoose';

export const logAudit = async (
  action: string,
  entity: string,
  description: string,
  userId?: string | Types.ObjectId,
  entityId?: string,
  ipAddress?: string
) => {
  try {
    await AuditLog.create({
      userId: userId ? new Types.ObjectId(userId) : undefined,
      action,
      entity,
      entityId,
      description,
      ipAddress: ipAddress || '127.0.0.1',
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};
