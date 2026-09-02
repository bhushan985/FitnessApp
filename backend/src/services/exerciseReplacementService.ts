import { Exercise, IExercise } from '../models/Exercise.js';


export interface IReplacementCandidate {
  exerciseId: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  mediaUrl: string;
  matchScore: number; // 0 - 100
  matchReason: string;
}

export class ExerciseReplacementService {
  /**
   * Find compatible, ranked exercise replacement options for a target exercise
   */
  public static async getReplacements(
    targetExerciseId: string,
    availableEquipment: string[] = ['Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight']
  ): Promise<IReplacementCandidate[]> {
    const targetEx = await Exercise.findById(targetExerciseId);
    if (!targetEx) {
      throw new Error('Target exercise not found');
    }

    const availableEquipmentLower = availableEquipment.map((e) => e.toLowerCase());

    // Query active exercises matching primary muscle or bodyPart
    const candidates = await Exercise.find({
      _id: { $ne: targetEx._id },
      isActive: true,
      $or: [
        { primaryMuscle: targetEx.primaryMuscle },
        { bodyPart: targetEx.bodyPart },
      ],
    });

    const ranked: IReplacementCandidate[] = [];

    for (const ex of candidates) {
      // Equipment constraint check
      const eq = (ex.equipment || 'bodyweight').toLowerCase();
      const isEqAvailable = eq === 'bodyweight' || availableEquipmentLower.some((reqEq) => eq.includes(reqEq) || reqEq.includes(eq));
      if (!isEqAvailable) continue;

      let score = 50;
      let reason = 'Same muscle group & compatible equipment';

      // Primary muscle exact match
      if (ex.primaryMuscle.toLowerCase() === targetEx.primaryMuscle.toLowerCase()) {
        score += 30;
        reason = `Direct ${ex.primaryMuscle} substitute using ${ex.equipment}`;
      }

      // Movement pattern match
      if (ex.movementPattern && targetEx.movementPattern && ex.movementPattern === targetEx.movementPattern) {
        score += 20;
        reason = `Matches ${ex.movementPattern} movement pattern with ${ex.equipment}`;
      }

      // Difficulty match bonus
      if (ex.difficulty === targetEx.difficulty) {
        score += 10;
      }

      ranked.push({
        exerciseId: ex._id.toString(),
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: ex.secondaryMuscles || [],
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        mediaUrl: ex.media?.url || ex.imageUrl || '',
        matchScore: Math.min(100, score),
        matchReason: reason,
      });
    }

    // Sort by match score descending
    ranked.sort((a, b) => b.matchScore - a.matchScore);

    return ranked.slice(0, 8);
  }
}
