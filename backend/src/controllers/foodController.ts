import { Request, Response } from 'express';
import { Food } from '../models/Food.js';
import { FoodRegion } from '../models/FoodRegion.js';

export class FoodController {
  public static async getFoods(req: Request, res: Response) {
    try {
      const { category, dietaryType, search, regionId } = req.query;
      const query: any = { isActive: true };

      if (category) query.category = category;
      if (dietaryType) query.dietaryType = dietaryType;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { localNames: { $regex: search, $options: 'i' } },
        ];
      }

      let foods = await Food.find(query).sort({ name: 1 });

      if (regionId) {
        const regionalLinks = await FoodRegion.find({ regionId, isActive: true });
        const regionalMap = new Map(regionalLinks.map((fr) => [fr.foodId.toString(), fr]));

        foods = foods.map((food) => {
          const fr = regionalMap.get(food._id.toString());
          const foodObj = food.toObject();
          return {
            ...foodObj,
            regionalInfo: fr
              ? {
                  availabilityScore: fr.availabilityScore,
                  popularityScore: fr.popularityScore,
                  seasonality: fr.seasonality,
                  localName: fr.localName,
                  averagePrice: fr.averagePrice,
                }
              : null,
          };
        }) as any;
      }

      return res.json({ success: true, count: foods.length, data: foods });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getFoodById(req: Request, res: Response) {
    try {
      const food = await Food.findById(req.params.id);
      if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });
      
      const foodRegions = await FoodRegion.find({ foodId: food._id }).populate('regionId');

      return res.json({
        success: true,
        data: {
          ...food.toObject(),
          foodRegions,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createFood(req: Request, res: Response) {
    try {
      const food = new Food(req.body);
      await food.save();
      return res.status(201).json({ success: true, data: food });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateFood(req: Request, res: Response) {
    try {
      const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
      return res.json({ success: true, data: food });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async deleteFood(req: Request, res: Response) {
    try {
      const food = await Food.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      return res.json({ success: true, message: 'Food deactivated', data: food });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
