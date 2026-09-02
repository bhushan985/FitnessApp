import { Request, Response } from 'express';
import { Exercise } from '../models/Exercise.js';
import { ExerciseReplacementService } from '../services/exerciseReplacementService.js';

export class ExerciseController {
  /**
   * Search and filter exercise library
   */
  public static async searchExercises(req: Request, res: Response) {
    try {
      const { q, muscle, equipment, difficulty, category } = req.query;

      const query: any = { isActive: true };

      if (q) {
        const searchRegex = new RegExp(q as string, 'i');
        query.$or = [
          { name: searchRegex },
          { aliases: searchRegex },
          { primaryMuscle: searchRegex },
          { bodyPart: searchRegex },
          { equipment: searchRegex },
        ];
      }

      if (muscle && muscle !== 'all') {
        const mRegex = new RegExp(muscle as string, 'i');
        query.$or = [
          { primaryMuscle: mRegex },
          { bodyPart: mRegex },
          { muscleGroups: mRegex },
        ];
      }

      if (equipment && equipment !== 'all') {
        query.equipment = new RegExp(equipment as string, 'i');
      }

      if (difficulty && difficulty !== 'all') {
        query.difficulty = difficulty;
      }

      if (category && category !== 'all') {
        query.category = category;
      }

      const exercises = await Exercise.find(query).limit(50);

      return res.json({
        success: true,
        count: exercises.length,
        data: exercises,
      });
    } catch (error: any) {
      console.error('searchExercises error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to search exercises' });
    }
  }

  /**
   * Get exercise detail by ID or Slug
   */
  public static async getExerciseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let exercise = await Exercise.findById(id);

      if (!exercise) {
        exercise = await Exercise.findOne({ slug: id });
      }

      if (!exercise) {
        return res.status(404).json({ success: false, message: 'Exercise not found' });
      }

      return res.json({
        success: true,
        data: exercise,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get compatible replacement exercises for an exercise ID
   */
  public static async getExerciseReplacements(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const equipmentStr = (req.query.equipment as string) || '';
      const availableEquipment = equipmentStr ? equipmentStr.split(',') : ['Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight'];

      const replacements = await ExerciseReplacementService.getReplacements(id, availableEquipment);

      return res.json({
        success: true,
        data: replacements,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
