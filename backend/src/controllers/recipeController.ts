import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { RecipeService } from '../services/recipeService.js';

export class RecipeController {
  public static async searchRecipes(req: AuthRequest, res: Response) {
    try {
      const { search, region, cuisine, mealType, dietaryType, goal } = req.query;
      const recipes = await RecipeService.searchRecipes({
        search: search as string,
        region: region as string,
        cuisine: cuisine as string,
        mealType: mealType as string,
        dietaryType: dietaryType as string,
        goal: goal as string,
      });

      return res.json({
        success: true,
        data: recipes,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getRecipeById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const recipe = await RecipeService.getRecipeById(id);
      if (!recipe) {
        return res.status(404).json({ success: false, message: 'Recipe not found' });
      }

      return res.json({
        success: true,
        data: recipe,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async logRecipe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id.toString();
      const { id } = req.params;
      const { servings = 1, mealType = 'lunch', date } = req.body;

      const log = await RecipeService.logRecipeToTracker(
        userId,
        id,
        Number(servings) || 1,
        mealType,
        date
      );

      return res.status(201).json({
        success: true,
        message: 'Recipe logged successfully to consumed daily nutrition',
        data: log,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
