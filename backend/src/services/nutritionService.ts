export interface INutritionInput {
  gender: 'male' | 'female' | 'other';
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: 'low' | 'moderate' | 'high';
  fitnessGoal: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'maintenance';
}

export interface INutritionResult {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
}

export class NutritionService {
  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   * Men: BMR = 10W + 6.25H - 5A + 5
   * Women: BMR = 10W + 6.25H - 5A - 161
   */
  public static calculateBMR(gender: string, weightKg: number, heightCm: number, age: number): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'female') {
      return base - 161;
    }
    return base + 5; // Default for male/other
  }

  public static calculateTargets(input: INutritionInput): INutritionResult {
    const bmr = this.calculateBMR(input.gender, input.weightKg, input.heightCm, input.age);

    // Activity Multiplier
    let activityMultiplier = 1.2;
    if (input.activityLevel === 'moderate') activityMultiplier = 1.55;
    if (input.activityLevel === 'high') activityMultiplier = 1.725;

    const tdee = Math.round(bmr * activityMultiplier);

    // Calorie Adjustment based on Goal
    let calorieTarget = tdee;
    if (input.fitnessGoal === 'weight_loss') {
      calorieTarget = Math.round(tdee * 0.8); // 20% deficit
    } else if (input.fitnessGoal === 'weight_gain') {
      calorieTarget = Math.round(tdee * 1.15); // 15% surplus
    } else if (input.fitnessGoal === 'muscle_building') {
      calorieTarget = Math.round(tdee * 1.1); // 10% surplus
    }

    // Macro Split
    // Protein: High protein for muscle/loss (2.0g/kg), default 1.8g/kg
    let proteinGPerKg = 1.8;
    if (input.fitnessGoal === 'muscle_building' || input.fitnessGoal === 'weight_loss') {
      proteinGPerKg = 2.0;
    }
    const proteinTargetG = Math.round(input.weightKg * proteinGPerKg);
    const proteinCalories = proteinTargetG * 4;

    // Fat: 25% of total calories (9 kcal/g)
    const fatCalories = calorieTarget * 0.25;
    const fatTargetG = Math.round(fatCalories / 9);

    // Carbs: Remaining calories (4 kcal/g)
    const carbCalories = Math.max(0, calorieTarget - (proteinCalories + fatCalories));
    const carbTargetG = Math.round(carbCalories / 4);

    return {
      bmr: Math.round(bmr),
      tdee,
      dailyCalorieTarget: calorieTarget,
      dailyProteinTarget: proteinTargetG,
      dailyCarbsTarget: carbTargetG,
      dailyFatTarget: fatTargetG,
    };
  }
}
