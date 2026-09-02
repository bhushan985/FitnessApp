import { isPrimaryMuscleMatch, getCanonicalMuscleIds } from '../config/muscleTaxonomy.js';

export interface IValidationResult {
  isValid: boolean;
  violations: string[];
  validatedWorkout: any;
}

export class WorkoutValidator {
  /**
   * Hard validation layer inspecting generated workout before returning to UI
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
        violations.push(`Duplicate exercise detected: "${name}"`);
        continue;
      }

      // 2. Primary Muscle Match Validation (CRITICAL FIX)
      // Check if exercise's primary target belongs to requested muscles
      const primaryList = ex.primaryMuscles && ex.primaryMuscles.length > 0
        ? ex.primaryMuscles
        : [ex.primaryMuscle];

      const isPrimaryMatch = isPrimaryMuscleMatch(primaryList, requestedTargetMuscles);

      if (!isPrimaryMatch) {
        violations.push(
          `Primary Target Violation: Exercise "${name}" has primary target [${primaryList.join(', ')}], which does not belong to requested targets [${requestedTargetMuscles.join(', ')}].`
        );
        continue;
      }

      // 3. Equipment Compatibility Check
      const exEq = (ex.equipment || 'bodyweight').toLowerCase();
      const isEqValid = exEq === 'bodyweight' || availableEqLower.some((req) => exEq.includes(req) || req.includes(exEq));

      if (!isEqValid) {
        violations.push(`Equipment Violation: Exercise "${name}" requires "${ex.equipment}", which is not in available equipment [${availableEquipment.join(', ')}].`);
        continue;
      }

      usedNames.add(name.toLowerCase());
      validExercises.push(ex);
    }

    const isValid = violations.length === 0 && validExercises.length > 0;

    const validatedWorkout = {
      ...workout,
      exercises: validExercises,
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
