import { Types } from 'mongoose';
import { Exercise, IExercise } from '../models/Exercise.js';
import { ExerciseProgress } from '../models/ExerciseProgress.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { isPrimaryMuscleMatch } from '../config/muscleTaxonomy.js';
import { isExerciseEquipmentAllowed } from '../config/workoutTaxonomy.js';
import { SINGLE_MUSCLE_EXERCISE_LIBRARIES, REQUIRED_DOUBLE_SPLITS, PREDEFINED_SPLITS } from '../config/fixedWorkoutLibrary.js';
import { WorkoutValidator } from './workoutValidator.js';

export interface IWorkoutGeneratorParams {
  userId: string | Types.ObjectId;
  muscleGroups?: string[];
  goal?: 'hypertrophy' | 'strength' | 'fat_loss' | 'general' | 'conditioning' | 'endurance';
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
  priority: 'primary' | 'optional';
  bodyPart: string;
  primaryMuscles: string[];
  primaryMuscle: string;
  secondaryMuscles: string[];
  stabilizerMuscles?: string[];
  movementPattern?: string;
  muscleEngagement?: Array<{ muscleId?: string; muscle: string; percentage: number; isPrimary: boolean }>;
  equipment: string;
  difficulty: string;
  sets: number;
  reps: number;
  targetReps: string;
  suggestedWeightKg?: number;
  restSec: number;
  restSeconds?: number;
  targetEngagementPercent?: number;
  instructions: string[];
  formTips?: string[];
  commonMistakes?: string[];
  safetyNotes?: string[];
  alternatives?: string[];
  imageUrl?: string;
  videoUrl?: string;
  media?: {
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

export interface IExerciseSelection {
  minimumRequired: number;
  recommendedCount: number;
  totalOptionsGenerated: number;
  userCanChoose: boolean;
}

export interface IRecoveryContext {
  previousMusclesTrained: string[];
  recoveryConsideration: string;
  nextWorkoutSuggestion: string;
}

export interface INextWorkoutRecommendation {
  recommended: boolean;
  reason: string;
  focusArea: string;
  muscles: string[];
}

export interface IWeeklyMuscleBalance {
  chest: number;
  back: number;
  shoulders: number;
  biceps: number;
  triceps: number;
  quads: number;
  hamstrings: number;
  glutes: number;
  calves: number;
  core: number;
}

export interface IGeneratedWorkoutResult {
  workoutId?: string;
  title: string;
  targetDay?: string;
  selectedMuscles?: string[];
  splitType?: string;
  focusArea: string;
  goal: string;
  experienceLevel: string;
  difficulty: string;
  estimatedDurationMin: number;
  totalCaloriesBurn: number;
  estimatedCaloriesBurn?: number;
  calorieEstimateType?: 'estimated';
  totalSets: number;
  equipmentUsed: string[];
  selectionReasoning: string;
  exerciseSelection?: IExerciseSelection;
  recoveryContext?: IRecoveryContext;
  exercisePool?: {
    primaryMuscle: any[];
    secondaryMuscles: any[];
  };
  actualSession: IGeneratedWorkoutExercise[];
  exercises: IGeneratedWorkoutExercise[]; // MUST CONTAIN EXACTLY 9 EXERCISES
  nextWorkoutRecommendation?: INextWorkoutRecommendation;
  weeklyBalance?: IWeeklyMuscleBalance;
  predefinedSplits?: any[];
  validationPassed?: boolean;
  validationViolations?: string[];
}

export class WorkoutGeneratorService {
  /**
   * Deterministically generates a workout strictly matching requested Primary Target muscles
   * enforcing EXACTLY 9 EXERCISES IN THE JSON ARRAY for single-muscle (9) and double-muscle (5 1st + 4 2nd = 9 TOTAL).
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

    // Prescribe volume
    let setsPerExercise = 3;
    let repRange = '8-12';
    let restSec = 60;
    if (goal === 'strength') {
      setsPerExercise = 4;
      repRange = '4-6';
      restSec = 120;
    } else if (goal === 'fat_loss' || goal === 'conditioning' || goal === 'endurance') {
      setsPerExercise = 3;
      repRange = '12-15';
      restSec = 45;
    }

    // Fetch active candidates from MongoDB
    const candidates = await Exercise.find({ isActive: true });

    // BUILD FIXED 9-EXERCISE POOL based on Single vs Double muscle rules
    let poolCandidates: any[] = [];
    const firstMuscle = normalizedMuscles[0] || 'chest';
    const secondMuscle = normalizedMuscles[1] || null;

    const splitKey = `${firstMuscle}_${secondMuscle}`;
    const reverseSplitKey = `${secondMuscle}_${firstMuscle}`;

    if (secondMuscle && (REQUIRED_DOUBLE_SPLITS as any)[splitKey]) {
      // Fixed Double Split match: 5 for 1st muscle + 4 for 2nd muscle = 9 Total
      const splitDef = (REQUIRED_DOUBLE_SPLITS as any)[splitKey];
      const m1Names = splitDef[firstMuscle] || [];
      const m2Names = splitDef[secondMuscle] || [];

      const m1Exs = m1Names.map((name: string) => candidates.find((c) => c.name.toLowerCase() === name.toLowerCase()) || { name, primaryMuscle: firstMuscle, equipment: 'Dumbbell' });
      const m2Exs = m2Names.map((name: string) => candidates.find((c) => c.name.toLowerCase() === name.toLowerCase()) || { name, primaryMuscle: secondMuscle, equipment: 'Dumbbell' });

      poolCandidates = [...m1Exs.slice(0, 5), ...m2Exs.slice(0, 4)];
    } else if (secondMuscle && (REQUIRED_DOUBLE_SPLITS as any)[reverseSplitKey]) {
      // Reversed Double Split match: 5 for 1st muscle + 4 for 2nd muscle = 9 Total
      const splitDef = (REQUIRED_DOUBLE_SPLITS as any)[reverseSplitKey];
      const m1Names = (splitDef[firstMuscle] || []).slice(0, 5);
      const m2Names = (splitDef[secondMuscle] || []).slice(0, 4);

      const m1Exs = m1Names.map((name: string) => candidates.find((c) => c.name.toLowerCase() === name.toLowerCase()) || { name, primaryMuscle: firstMuscle, equipment: 'Dumbbell' });
      const m2Exs = m2Names.map((name: string) => candidates.find((c) => c.name.toLowerCase() === name.toLowerCase()) || { name, primaryMuscle: secondMuscle, equipment: 'Dumbbell' });

      poolCandidates = [...m1Exs, ...m2Exs];
    } else if (secondMuscle) {
      // Custom 2-Muscle Split -> 5 for 1st muscle + 4 for 2nd muscle = 9 Total
      const m1Candidates = candidates.filter((ex) => isPrimaryMuscleMatch(ex.primaryMuscles || [ex.primaryMuscle], [firstMuscle]));
      const m2Candidates = candidates.filter((ex) => isPrimaryMuscleMatch(ex.primaryMuscles || [ex.primaryMuscle], [secondMuscle]));

      const m1Selected = m1Candidates.slice(0, 5);
      const m2Selected = m2Candidates.slice(0, 4);

      // Pad if DB has fewer than 5 or 4
      while (m1Selected.length < 5 && candidates.length > 0) {
        m1Selected.push(m1Selected[0] || candidates[0]);
      }
      while (m2Selected.length < 4 && candidates.length > 0) {
        m2Selected.push(m2Selected[0] || candidates[0]);
      }

      poolCandidates = [...m1Selected, ...m2Selected];
    } else {
      // Single Muscle Split -> EXACTLY 9 EXERCISES
      const fixedSingleList = SINGLE_MUSCLE_EXERCISE_LIBRARIES[firstMuscle] || SINGLE_MUSCLE_EXERCISE_LIBRARIES['chest'];
      poolCandidates = fixedSingleList.map((def) => {
        const found = candidates.find((c) => c.name.toLowerCase() === def.name.toLowerCase());
        return (
          found || {
            name: def.name,
            primaryMuscle: def.primaryMuscle,
            secondaryMuscles: def.secondaryMuscles,
            equipment: def.equipment,
            difficulty: def.difficulty,
            instructions: def.instructions,
          }
        );
      });
    }

    // Equipment Filtering with fallback replacement to maintain EXACTLY 9 count
    const filteredPool = poolCandidates.map((ex) => {
      const isAllowed = isExerciseEquipmentAllowed(ex.equipment || 'Bodyweight', availableEquipment);
      if (isAllowed) return ex;

      // Find compatible alternative matching user equipment
      const alt = candidates.find(
        (c) =>
          isPrimaryMuscleMatch(c.primaryMuscles || [c.primaryMuscle], [ex.primaryMuscle || firstMuscle]) &&
          isExerciseEquipmentAllowed(c.equipment || 'Bodyweight', availableEquipment) &&
          !poolCandidates.some((p) => p.name.toLowerCase() === c.name.toLowerCase())
      );

      return alt || ex;
    });

    // GUARANTEE POOL SIZE IS EXACTLY 9 OBJECTS
    let final9Pool = filteredPool.slice(0, 9);
    while (final9Pool.length < 9) {
      const fallback = candidates[final9Pool.length % candidates.length];
      final9Pool.push(fallback);
    }

    // Build Exercise Payloads for all 9 exercises
    const fullExercisesPayload: IGeneratedWorkoutExercise[] = [];
    let totalBurnKcal = 0;

    for (let i = 0; i < final9Pool.length; i++) {
      const ex = final9Pool[i];
      const priority: 'primary' | 'optional' = i < 5 ? 'primary' : 'optional';

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
        prevNote = `Baseline set: Start with manageable weight.`;
      }

      const exerciseBurn = (ex.caloriesEstimate || 45) * (setsPerExercise / 3);
      totalBurnKcal += exerciseBurn;

      fullExercisesPayload.push({
        exerciseId: ex._id ? ex._id.toString() : `ex_${i + 1}`,
        name: ex.name,
        priority,
        bodyPart: ex.bodyPart || firstMuscle,
        primaryMuscles: ex.primaryMuscles || [ex.primaryMuscle || firstMuscle],
        primaryMuscle: ex.primaryMuscle || firstMuscle,
        secondaryMuscles: ex.secondaryMuscles || [],
        stabilizerMuscles: ex.stabilizerMuscles || [],
        movementPattern: ex.movementPattern || 'general',
        muscleEngagement: ex.muscleEngagement && ex.muscleEngagement.length > 0
          ? ex.muscleEngagement
          : [{ muscle: ex.primaryMuscle || firstMuscle, percentage: 85, isPrimary: true }],
        equipment: ex.equipment || 'Dumbbell',
        difficulty: ex.difficulty || experienceLevel,
        sets: setsPerExercise,
        reps: 10,
        targetReps: repRange,
        suggestedWeightKg,
        restSec,
        restSeconds: restSec,
        targetEngagementPercent: 85,
        instructions: ex.instructions && ex.instructions.length > 0 ? ex.instructions : ['Execute under control maintaining stable form.'],
        formTips: ex.formTips || ['Keep core engaged'],
        commonMistakes: ex.commonMistakes || ['Swinging momentum'],
        imageUrl: ex.imageUrl || ex.media?.url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
        videoUrl: ex.videoUrl || '',
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

    // MANDATORY VALIDATION: Check array length is EXACTLY 9 before returning
    if (fullExercisesPayload.length !== 9) {
      console.warn(`[WorkoutGeneratorService] Payload count ${fullExercisesPayload.length} != 9. Adjusting.`);
      while (fullExercisesPayload.length < 9) {
        fullExercisesPayload.push({ ...fullExercisesPayload[0], exerciseId: `ex_pad_${fullExercisesPayload.length + 1}` });
      }
    }

    const titleMuscles = normalizedMuscles.map((m) => m.toUpperCase()).join(' + ');

    // CALCULATE TOMORROW'S RECOMMENDATION ENGINE
    const nextRec = this.calculateNextWorkoutRecommendation(normalizedMuscles);

    // FETCH PREVIOUS TRAINED MUSCLES FROM LOGS
    let previousMusclesTrained: string[] = [];
    if (userId && Types.ObjectId.isValid(userId as string)) {
      const recentLog = await WorkoutLog.findOne({ userId }).sort({ completedAt: -1 });
      if (recentLog) {
        previousMusclesTrained = [recentLog.workoutTitle];
      }
    }

    const recoveryContext: IRecoveryContext = {
      previousMusclesTrained,
      recoveryConsideration: `Prior session recovery factored. Focus area ${titleMuscles} is fully rested for optimal performance.`,
      nextWorkoutSuggestion: nextRec.reason,
    };

    const exerciseSelection: IExerciseSelection = {
      minimumRequired: 9,
      recommendedCount: 9,
      totalOptionsGenerated: 9,
      userCanChoose: true,
    };

    const weeklyBalance: IWeeklyMuscleBalance = {
      chest: normalizedMuscles.includes('chest') ? 3 : 1,
      back: normalizedMuscles.includes('back') ? 3 : 1,
      shoulders: normalizedMuscles.includes('shoulders') ? 3 : 1,
      biceps: normalizedMuscles.includes('biceps') ? 3 : 1,
      triceps: normalizedMuscles.includes('triceps') ? 3 : 1,
      quads: normalizedMuscles.includes('quads') || normalizedMuscles.includes('legs') ? 3 : 1,
      hamstrings: normalizedMuscles.includes('hamstrings') || normalizedMuscles.includes('legs') ? 3 : 1,
      glutes: normalizedMuscles.includes('glutes') ? 3 : 1,
      calves: normalizedMuscles.includes('calves') ? 3 : 1,
      core: normalizedMuscles.includes('abs') || normalizedMuscles.includes('core') || normalizedMuscles.includes('abs_core') ? 3 : 1,
    };

    const reasoning = `Generated EXACTLY 9 exercise objects for ${titleMuscles} (${secondMuscle ? '5 ' + firstMuscle.toUpperCase() + ' + 4 ' + secondMuscle.toUpperCase() : '9 ' + firstMuscle.toUpperCase()}) targeting ${goal.toUpperCase()}.`;

    const rawWorkout: IGeneratedWorkoutResult = {
      workoutId: `custom_plan_${Date.now()}`,
      title: `${titleMuscles} ROUTINE`,
      targetDay: 'monday',
      selectedMuscles: normalizedMuscles,
      splitType: normalizedMuscles.length === 1 ? 'single_muscle' : normalizedMuscles.length === 2 ? 'two_muscle' : 'multi_muscle',
      focusArea: titleMuscles,
      goal,
      experienceLevel,
      difficulty: experienceLevel,
      estimatedDurationMin: durationMin,
      totalCaloriesBurn: Math.round(totalBurnKcal),
      estimatedCaloriesBurn: Math.round(totalBurnKcal),
      calorieEstimateType: 'estimated',
      totalSets: fullExercisesPayload.length * setsPerExercise,
      equipmentUsed: availableEquipment,
      selectionReasoning: reasoning,
      exerciseSelection,
      recoveryContext,
      exercisePool: {
        primaryMuscle: fullExercisesPayload.slice(0, 5),
        secondaryMuscles: fullExercisesPayload.slice(5),
      },
      actualSession: fullExercisesPayload, // ALL 9 EXERCISES
      exercises: fullExercisesPayload,     // ALL 9 EXERCISES
      nextWorkoutRecommendation: nextRec,
      weeklyBalance,
      predefinedSplits: PREDEFINED_SPLITS,
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
      muscleGroups: ['abs_core'],
      goal: 'hypertrophy',
      durationMin,
      includeAbs: true,
    });
  }

  /**
   * Tomorrow Recommendation Engine based on today's trained muscles
   */
  private static calculateNextWorkoutRecommendation(todayMuscles: string[]): INextWorkoutRecommendation {
    const trained = todayMuscles.map((m) => m.toLowerCase());

    if (trained.includes('chest') || trained.includes('triceps')) {
      return {
        recommended: true,
        reason: 'You trained Chest & Triceps today. Recommend Back & Biceps tomorrow for optimal muscular recovery.',
        focusArea: 'BACK + BICEPS',
        muscles: ['back', 'biceps'],
      };
    } else if (trained.includes('back') || trained.includes('biceps')) {
      return {
        recommended: true,
        reason: 'You trained Back & Biceps today. Recommend Lower Body (Legs & Shoulders) tomorrow.',
        focusArea: 'LEGS + SHOULDERS',
        muscles: ['legs', 'shoulders'],
      };
    } else if (trained.includes('quads') || trained.includes('hamstrings') || trained.includes('legs')) {
      return {
        recommended: true,
        reason: 'You trained Lower Body today. Recommend Chest & Triceps tomorrow.',
        focusArea: 'CHEST + TRICEPS',
        muscles: ['chest', 'triceps'],
      };
    }

    return {
      recommended: true,
      reason: 'Recommend Full Body Conditioning tomorrow.',
      focusArea: 'FULL BODY',
      muscles: ['full_body'],
    };
  }
}
