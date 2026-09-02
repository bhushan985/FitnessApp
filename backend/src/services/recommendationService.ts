import { IFood } from '../models/Food.js';
import { IFoodRegion } from '../models/FoodRegion.js';
import { IUserProfile } from '../models/UserProfile.js';
import { RecommendationFeedback } from '../models/RecommendationFeedback.js';

export interface IScoredFood {
  food: IFood;
  foodRegion?: IFoodRegion;
  totalScore: number;
  reasons: string[];
  regionMatch: boolean;
  nutritionMatch: boolean;
  preferenceMatch: boolean;
  goalMatch: boolean;
  availabilityMatch: boolean;
}

export class RecommendationService {
  public static async scoreCandidateFoods(
    foods: IFood[],
    foodRegions: Map<string, IFoodRegion>,
    profile: IUserProfile,
    dietTypeOverride?: 'veg' | 'non_veg' | 'eggetarian' | 'vegan'
  ): Promise<IScoredFood[]> {
    const activeDietType = dietTypeOverride || profile.dietType;

    // Fetch historical feedback for user
    const userFeedback = await RecommendationFeedback.find({ userId: profile.userId });
    const likedFoodIds = new Set(
      userFeedback.filter((f) => f.feedbackType === 'liked' || f.feedbackType === 'consumed').map((f) => f.foodId.toString())
    );
    const dislikedFoodIds = new Set(
      userFeedback.filter((f) => f.feedbackType === 'disliked').map((f) => f.foodId.toString())
    );

    const scoredList: IScoredFood[] = [];

    for (const food of foods) {
      const foodIdStr = food._id.toString();

      // STRICT FILTER 1: Dietary Type
      if (activeDietType === 'veg' && (food.dietaryType === 'non_veg' || food.dietaryType === 'egg')) {
        continue;
      }
      if (activeDietType === 'eggetarian' && food.dietaryType === 'non_veg') {
        continue;
      }

      // STRICT FILTER 2: Allergies
      const hasAllergyConflict = profile.allergies.some((allergy) => {
        const allergyLower = allergy.toLowerCase();
        return (
          food.name.toLowerCase().includes(allergyLower) ||
          food.ingredients.some((ing) => ing.toLowerCase().includes(allergyLower))
        );
      });
      if (hasAllergyConflict) {
        continue;
      }

      // STRICT FILTER 3: Dislikes
      const isDisliked = profile.foodDislikes.some((dislike) =>
        food.name.toLowerCase().includes(dislike.toLowerCase())
      ) || dislikedFoodIds.has(foodIdStr);

      if (isDisliked) {
        continue; // Exclude disliked items
      }

      // Scoring Breakdown
      let score = 50; // Base score
      const reasons: string[] = [];

      // 1. Region Match & Popularity
      const foodRegion = foodRegions.get(foodIdStr);
      let regionMatch = false;
      let availabilityMatch = false;

      if (foodRegion) {
        regionMatch = true;
        availabilityMatch = foodRegion.availabilityScore >= 5;
        score += foodRegion.popularityScore * 3; // up to +30
        reasons.push(`✓ Popular & locally available in your region (${foodRegion.localName || food.name})`);
      } else {
        score += 10; // general food
      }

      // 2. Diet & Preference Match
      let preferenceMatch = false;
      if (activeDietType === food.dietaryType || (activeDietType === 'veg' && food.dietaryType === 'vegan')) {
        preferenceMatch = true;
        reasons.push(`✓ Matches your ${activeDietType.replace('_', '-')} diet preference`);
        score += 15;
      }

      const isPreferred = profile.foodPreferences.some((pref) =>
        food.name.toLowerCase().includes(pref.toLowerCase())
      ) || likedFoodIds.has(foodIdStr);

      if (isPreferred) {
        score += 20;
        reasons.push(`✓ Favorite choice based on your preferences & feedback history`);
      }

      // 3. Goal & Macro Alignment
      let goalMatch = false;
      let nutritionMatch = false;

      const proteinRatio = (food.nutrition.proteinG * 4) / (food.nutrition.calories || 1);

      if (profile.fitnessGoal === 'muscle_building' || profile.fitnessGoal === 'weight_loss') {
        if (proteinRatio >= 0.2 || food.nutrition.proteinG >= 8) {
          goalMatch = true;
          nutritionMatch = true;
          score += 20;
          reasons.push(`✓ High in protein (${food.nutrition.proteinG}g per serving) supporting your ${profile.fitnessGoal.replace('_', ' ')} goal`);
        }
      } else if (profile.fitnessGoal === 'weight_gain') {
        if (food.nutrition.calories >= 250) {
          goalMatch = true;
          nutritionMatch = true;
          score += 15;
          reasons.push(`✓ Calorie-dense meal option (${food.nutrition.calories} kcal) supporting healthy weight gain`);
        }
      } else {
        goalMatch = true;
        nutritionMatch = true;
        reasons.push(`✓ Well-balanced nutrition fitting your maintenance target`);
      }

      // Normalize score out of 100
      const totalScore = Math.min(100, Math.max(10, score));

      scoredList.push({
        food,
        foodRegion,
        totalScore,
        reasons,
        regionMatch,
        nutritionMatch,
        preferenceMatch,
        goalMatch,
        availabilityMatch,
      });
    }

    // Sort by total score descending
    return scoredList.sort((a, b) => b.totalScore - a.totalScore);
  }
}
