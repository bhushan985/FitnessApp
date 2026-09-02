import { Response, Request } from 'express';
import { Region } from '../models/Region.js';

export class RegionController {
  public static async getRegions(req: Request, res: Response) {
    try {
      const regions = await Region.find({ isActive: true }).sort({ country: 1, state: 1, city: 1 });
      return res.json({ success: true, data: regions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getRegionById(req: Request, res: Response) {
    try {
      const region = await Region.findById(req.params.id);
      if (!region) return res.status(404).json({ success: false, message: 'Region not found' });
      return res.json({ success: true, data: region });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async createRegion(req: Request, res: Response) {
    try {
      const { country, state, city, regionName, timezone } = req.body;
      const region = new Region({
        country: country || 'India',
        state: state || 'Maharashtra',
        city: city || 'Mumbai',
        regionName: regionName || city || 'Mumbai',
        timezone: timezone || 'Asia/Kolkata',
      });
      await region.save();
      return res.status(201).json({ success: true, data: region });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
