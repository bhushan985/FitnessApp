import { Recipe, IRecipe } from '../models/Recipe.js';
import { FoodLogService } from './foodLogService.js';

export interface IRecipeQuery {
  search?: string;
  region?: string;
  cuisine?: string;
  mealType?: string;
  dietaryType?: string;
  goal?: string;
}

export class RecipeService {
  public static async searchRecipes(query: IRecipeQuery): Promise<IRecipe[]> {
    const filter: any = { isActive: true };

    if (query.dietaryType && query.dietaryType !== 'all') {
      filter.dietaryType = query.dietaryType;
    }
    if (query.mealType && query.mealType !== 'all') {
      filter.mealType = query.mealType;
    }
    if (query.region && query.region !== 'all') {
      filter.region = new RegExp(query.region, 'i');
    }
    if (query.cuisine && query.cuisine !== 'all') {
      filter.cuisine = new RegExp(query.cuisine, 'i');
    }
    if (query.goal && query.goal !== 'all') {
      filter.goalTags = query.goal;
    }

    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, 'i') },
        { localNames: new RegExp(query.search, 'i') },
        { cuisine: new RegExp(query.search, 'i') },
        { region: new RegExp(query.search, 'i') },
      ];
    }

    return await Recipe.find(filter).sort({ rating: -1, createdAt: -1 });
  }

  public static async getRecipeById(recipeId: string): Promise<IRecipe | null> {
    return await Recipe.findById(recipeId);
  }

  // Scale recipe ingredients and nutrition based on target servings
  public static scaleRecipe(recipe: IRecipe, targetServings: number) {
    const baseServings = recipe.servings || 1;
    const ratio = targetServings / baseServings;

    const scaledIngredients = recipe.ingredients.map((ing) => ({
      item: ing.item,
      amount: Math.round(ing.amount * ratio * 10) / 10,
      unit: ing.unit,
      gramsEquivalent: Math.round(ing.gramsEquivalent * ratio),
    }));


    const scaledNutrition = {
      calories: Math.round(recipe.nutritionPerServing.calories * targetServings),
      protein: Math.round(recipe.nutritionPerServing.protein * targetServings * 10) / 10,
      carbohydrates: Math.round(recipe.nutritionPerServing.carbohydrates * targetServings * 10) / 10,
      fat: Math.round(recipe.nutritionPerServing.fat * targetServings * 10) / 10,
      fiber: Math.round(recipe.nutritionPerServing.fiber * targetServings * 10) / 10,
    };

    return {
      recipe,
      targetServings,
      ratio,
      scaledIngredients,
      scaledNutrition,
    };
  }

  // Log scaled recipe to user's actual consumed FoodLog
  public static async logRecipeToTracker(
    userId: string,
    recipeId: string,
    servings: number = 1,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | 'other' = 'lunch',
    dateStr?: string
  ) {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const scaled = RecipeService.scaleRecipe(recipe, servings);
    const estimatedGrams = 300 * servings;

    return await FoodLogService.logFood({
      userId,
      date: dateStr,
      mealType,
      foodName: recipe.name,
      quantity: servings,
      unit: 'serving',
      grams: estimatedGrams,
      nutrition: scaled.scaledNutrition,
      source: {
        type: 'recipe',
        referenceId: recipe._id.toString(),
      },
      imageUrl: recipe.image,
    });
  }
}
