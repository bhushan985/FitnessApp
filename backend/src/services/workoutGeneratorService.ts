import { Types } from 'mongoose';
import { Exercise, IExercise } from '../models/Exercise.js';
import { ExerciseProgress } from '../models/ExerciseProgress.js';
import { isPrimaryMuscleMatch, getCanonicalMuscleIds } from '../config/muscleTaxonomy.js';
import { WorkoutValidator } from './workoutValidator.js';

export interface IWorkoutGeneratorParams {
  userId: string | Types.ObjectId;
  muscleGroups?: string[];
  goal?: 'hypertrophy' | 'strength' | 'fat_loss' | 'general';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  availableEquipment?: string[];
  durationMin?: number;
  includeAbs?: boolean;
  preferredExercises?: string[];
  excludedExercises?: string[];
}

export interface IGeneratedWorkoutExercise {
  exerciseId: string;
  name: string;
  bodyPart: string;
  primaryMuscles: string[];
  primaryMuscle: string;
  secondaryMuscles: string[];
  stabilizerMuscles: string[];
  muscleEngagement: Array<{ muscleId?: string; muscle: string; percentage: number; isPrimary: boolean }>;
  equipment: string;
  difficulty: string;
  sets: number;
  targetReps: string;
  suggestedWeightKg: number;
  restSeconds: number;
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  media: {
    type: string;
    url: string;
    thumbnailUrl?: string;
  };
  previousPerformance?: {
    lastWeightKg: number;
    lastReps: number;
    recommendedNote: string;
  };
}

export interface IGeneratedWorkoutResult {
  title: string;
  focusArea: string;
  goal: string;
  experienceLevel: string;
  estimatedDurationMin: number;
  totalCaloriesBurn: number;
  totalSets: number;
  equipmentUsed: string[];
  exercises: IGeneratedWorkoutExercise[];
  selectionReasoning: string;
  validationPassed?: boolean;
  validationViolations?: string[];
}

export class WorkoutGeneratorService {
  /**
   * Deterministically generates a workout strictly matching requested Primary Target muscles
   */
  public static async generateWorkout(params: IWorkoutGeneratorParams): Promise<IGeneratedWorkoutResult> {
    const {
      userId,
      muscleGroups = ['shoulders', 'triceps'],
      goal = 'hypertrophy',
      experienceLevel = 'intermediate',
      availableEquipment = ['Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight', 'Bench'],
      durationMin = 45,
      includeAbs = false,
      excludedExercises = [],
    } = params;

    const normalizedMuscles = muscleGroups.map((m) => m.toLowerCase().trim());
    if (includeAbs && !normalizedMuscles.includes('abs') && !normalizedMuscles.includes('core')) {
      normalizedMuscles.push('abs');
    }

    // Determine target count
    let targetExerciseCount = 6;
    if (durationMin <= 15) targetExerciseCount = 3;
    else if (durationMin <= 25) targetExerciseCount = 4;
    else if (durationMin <= 35) targetExerciseCount = 5;
    else if (durationMin <= 50) targetExerciseCount = 6;
    else targetExerciseCount = 8;

    // Prescribe volume
    let setsPerExercise = 3;
    let repRange = '8-12';
    let restSec = 60;
    if (goal === 'strength') {
      setsPerExercise = 4;
      repRange = '4-6';
      restSec = 120;
    } else if (goal === 'fat_loss') {
      setsPerExercise = 3;
      repRange = '12-15';
      restSec = 45;
    }

    // Fetch active exercise candidates from MongoDB
    const candidates = await Exercise.find({ isActive: true });

    // Equipment filter
    const availableEquipmentLower = availableEquipment.map((e) => e.toLowerCase());
    const eqCandidates = candidates.filter((ex) => {
      const eq = (ex.equipment || 'bodyweight').toLowerCase();
      if (eq === 'bodyweight') return true;
      return availableEquipmentLower.some((reqEq) => eq.includes(reqEq) || reqEq.includes(eq));
    });

    // STRICT PRIMARY TARGET FILTER: Exercise primaryMuscles MUST match requested targets!
    const targetMatches = eqCandidates.filter((ex) => {
      const exPrimaryList = ex.primaryMuscles && ex.primaryMuscles.length > 0
        ? ex.primaryMuscles
        : [ex.primaryMuscle];

      return isPrimaryMuscleMatch(exPrimaryList, normalizedMuscles);
    });

    // Score & select candidates balancing subdivisions
    const selectedExercises: IExercise[] = [];
    const usedNames = new Set<string>(excludedExercises.map((e) => e.toLowerCase()));

    for (const muscleTarget of normalizedMuscles) {
      const matchedForTarget = targetMatches.filter((ex) => {
        if (usedNames.has(ex.name.toLowerCase())) return false;
        const pList = ex.primaryMuscles && ex.primaryMuscles.length > 0 ? ex.primaryMuscles : [ex.primaryMuscle];
        return isPrimaryMuscleMatch(pList, [muscleTarget]);
      });

      for (const chosen of matchedForTarget) {
        if (selectedExercises.length >= targetExerciseCount) break;
        if (!usedNames.has(chosen.name.toLowerCase())) {
          selectedExercises.push(chosen);
          usedNames.add(chosen.name.toLowerCase());
        }
      }
    }

    // Fill remaining if needed from valid targetMatches
    if (selectedExercises.length < targetExerciseCount) {
      for (const ex of targetMatches) {
        if (selectedExercises.length >= targetExerciseCount) break;
        if (!usedNames.has(ex.name.toLowerCase())) {
          selectedExercises.push(ex);
          usedNames.add(ex.name.toLowerCase());
        }
      }
    }

    // Build Exercise Payloads
    const finalExercises: IGeneratedWorkoutExercise[] = [];
    let totalBurnKcal = 0;

    for (const ex of selectedExercises) {
      // Progressive overload check from ExerciseProgress
      let progressRecord = null;
      if (userId && Types.ObjectId.isValid(userId as string)) {
        progressRecord = await ExerciseProgress.findOne({ userId, exerciseName: ex.name });
      }

      let suggestedWeightKg = 12;
      let prevNote = '';

      if (progressRecord && progressRecord.history.length > 0) {
        const lastSession = progressRecord.history[progressRecord.history.length - 1];
        if (lastSession.sets.length > 0) {
          const lastWeight = lastSession.maxWeightKg || 12;
          const lastReps = lastSession.sets[0].reps || 10;
          suggestedWeightKg = lastWeight;
          prevNote = `Last session: ${lastWeight} kg × ${lastReps} reps. Goal: ${lastWeight} kg × ${repRange} reps.`;
        }
      } else {
        prevNote = `Baseline set: Start with light/moderate weight to determine target.`;
      }

      const exerciseBurn = (ex.caloriesEstimate || 45) * (setsPerExercise / 3);
      totalBurnKcal += exerciseBurn;

      finalExercises.push({
        exerciseId: ex._id.toString(),
        name: ex.name,
        bodyPart: ex.bodyPart,
        primaryMuscles: ex.primaryMuscles || [ex.primaryMuscle],
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: ex.secondaryMuscles || [],
        stabilizerMuscles: ex.stabilizerMuscles || [],
        muscleEngagement: ex.muscleEngagement && ex.muscleEngagement.length > 0
          ? ex.muscleEngagement
          : [
              { muscle: ex.primaryMuscle, percentage: 70, isPrimary: true },
              ...(ex.secondaryMuscles || []).map((m) => ({ muscle: m, percentage: 30 / Math.max(1, ex.secondaryMuscles.length), isPrimary: false })),
            ],
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        sets: setsPerExercise,
        targetReps: repRange,
        suggestedWeightKg,
        restSeconds: restSec,
        instructions: ex.instructions && ex.instructions.length > 0 ? ex.instructions : ['Execute under control maintaining stable form.'],
        formTips: ex.formTips || ['Keep core engaged'],
        commonMistakes: ex.commonMistakes || ['Swinging momentum'],
        media: {
          type: ex.media?.type || 'gif',
          url: ex.media?.url || ex.imageUrl || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
          thumbnailUrl: ex.media?.thumbnailUrl || ex.thumbnailUrl,
        },
        previousPerformance: progressRecord
          ? {
              lastWeightKg: progressRecord.personalRecordWeightKg || 12,
              lastReps: progressRecord.personalRecordReps || 10,
              recommendedNote: prevNote,
            }
          : undefined,
      });
    }

    const titleMuscles = normalizedMuscles.map((m) => m.toUpperCase()).join(' + ');
    const reasoning = `Recommended session for ${titleMuscles} targeting ${goal.toUpperCase()} (${setsPerExercise} sets × ${repRange} reps) scoped strictly to primary targets matching your available equipment (${availableEquipment.join(', ')}).`;

    const rawWorkout: IGeneratedWorkoutResult = {
      title: `${titleMuscles} ROUTINE`,
      focusArea: titleMuscles,
      goal,
      experienceLevel,
      estimatedDurationMin: durationMin,
      totalCaloriesBurn: Math.round(totalBurnKcal),
      totalSets: finalExercises.length * setsPerExercise,
      equipmentUsed: availableEquipment,
      exercises: finalExercises,
      selectionReasoning: reasoning,
    };

    // HARD WORKOUT VALIDATION LAYER PASS
    const validation = WorkoutValidator.validateGeneratedWorkout(rawWorkout, normalizedMuscles, availableEquipment);

    return validation.validatedWorkout;
  }

  /**
   * Dedicated Abs / Core Generator
   */
  public static async generateAbsWorkout(durationMin: number = 15): Promise<IGeneratedWorkoutResult> {
    return this.generateWorkout({
      userId: 'system',
      muscleGroups: ['abs', 'core'],
      goal: 'hypertrophy',
      durationMin,
      includeAbs: true,
    });
  }
}
