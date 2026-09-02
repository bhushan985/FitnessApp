import { Types } from 'mongoose';
import { WorkoutGeneratorService, IGeneratedWorkoutResult, IWorkoutGeneratorParams } from './workoutGeneratorService.js';


export class WorkoutAIQueryService {
  /**
   * Converts natural language prompt into structured parameters and runs deterministic workout generator
   */
  public static async parseAndGenerate(userId: string | Types.ObjectId, prompt: string): Promise<IGeneratedWorkoutResult> {
    const p = prompt.toLowerCase();

    // Muscle Extraction
    const muscleGroups: string[] = [];
    if (p.includes('chest')) muscleGroups.push('chest');
    if (p.includes('back')) muscleGroups.push('back');
    if (p.includes('biceps') || p.includes('arms')) muscleGroups.push('biceps');
    if (p.includes('triceps')) muscleGroups.push('triceps');
    if (p.includes('shoulders') || p.includes('delts')) muscleGroups.push('shoulders');
    if (p.includes('legs') || p.includes('quads') || p.includes('glutes')) muscleGroups.push('legs');
    if (p.includes('abs') || p.includes('core')) muscleGroups.push('abs');

    // Default if no muscles extracted
    if (muscleGroups.length === 0) {
      if (p.includes('push')) muscleGroups.push('chest', 'shoulders', 'triceps');
      else if (p.includes('pull')) muscleGroups.push('back', 'biceps');
      else if (p.includes('upper')) muscleGroups.push('chest', 'back', 'shoulders');
      else muscleGroups.push('back', 'biceps');
    }

    // Equipment Extraction
    const availableEquipment: string[] = [];
    if (p.includes('dumbbell') || p.includes('dumbbells')) availableEquipment.push('Dumbbell');
    if (p.includes('barbell')) availableEquipment.push('Barbell');
    if (p.includes('cable')) availableEquipment.push('Cable');
    if (p.includes('machine')) availableEquipment.push('Machine');
    if (p.includes('bodyweight') || p.includes('home')) availableEquipment.push('Bodyweight');

    if (availableEquipment.length === 0) {
      availableEquipment.push('Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight', 'Bench');
    }

    // Duration Extraction
    let durationMin = 45;
    if (p.includes('15') || p.includes('quick')) durationMin = 15;
    else if (p.includes('20')) durationMin = 20;
    else if (p.includes('30')) durationMin = 30;
    else if (p.includes('60') || p.includes('hour')) durationMin = 60;
    else if (p.includes('75')) durationMin = 75;

    // Goal Extraction
    let goal: 'hypertrophy' | 'strength' | 'fat_loss' | 'general' = 'hypertrophy';
    if (p.includes('strength') || p.includes('heavy')) goal = 'strength';
    else if (p.includes('fat loss') || p.includes('burn') || p.includes('cardio')) goal = 'fat_loss';

    const generatorParams: IWorkoutGeneratorParams = {
      userId,
      muscleGroups,
      availableEquipment,
      durationMin,
      goal,
      includeAbs: muscleGroups.includes('abs'),
    };

    return WorkoutGeneratorService.generateWorkout(generatorParams);
  }
}
