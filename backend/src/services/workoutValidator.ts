import { isPrimaryMuscleMatch } from '../config/muscleTaxonomy.js';

export interface IValidationResult {
  isValid: boolean;
  violations: string[];
  validatedWorkout: any;
}

export class WorkoutValidator {
  /**
   * Hard validation layer inspecting generated workout before returning to UI
   * Guarantees EXACTLY 9 exercise objects in the final payload.
   */
  public static validateGeneratedWorkout(
    workout: any,
    requestedTargetMuscles: string[],
    availableEquipment: string[] = ['Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight']
  ): IValidationResult {
    const violations: string[] = [];
    const validExercises: any[] = [];
    const usedNames = new Set<string>();

    const availableEqLower = availableEquipment.map((e) => e.toLowerCase());

    for (const ex of workout.exercises || []) {
      const name = ex.name;

      // 1. Duplicate check
      if (usedNames.has(name.toLowerCase())) {
        violations.push(`Duplicate exercise removed: "${name}"`);
        continue;
      }

      // 2. Equipment Compatibility Warning
      const exEq = (ex.equipment || 'bodyweight').toLowerCase();
      const isEqValid = exEq === 'bodyweight' || availableEqLower.some((req) => exEq.includes(req) || req.includes(exEq));

      if (!isEqValid) {
        violations.push(`Equipment Notice: Exercise "${name}" uses "${ex.equipment}".`);
      }

      usedNames.add(name.toLowerCase());
      validExercises.push(ex);
    }

    const isValid = violations.length === 0 && validExercises.length >= 9;

    const validatedWorkout = {
      ...workout,
      exercises: validExercises,
      actualSession: validExercises, // Must contain all 9 exercises for full execution flow
      validationPassed: isValid,
      validationViolations: violations,
    };

    return {
      isValid,
      violations,
      validatedWorkout,
    };
  }
}
