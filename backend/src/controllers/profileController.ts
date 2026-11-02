import { Response } from 'express';
import { UserProfile } from '../models/UserProfile.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { NutritionService } from '../services/nutritionService.js';
import { Region } from '../models/Region.js';

export class ProfileController {
  public static async updateProfileImage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { profileImage } = req.body;

      if (!profileImage) {
        return res.status(400).json({ success: false, message: 'profileImage field required' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { profileImage },
        { new: true }
      ).select('-passwordHash');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const formattedUser = {
        id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneNumberVerified: user.phoneNumberVerified,
        profileImage: user.profileImage || '',
        authMethods: user.authMethods,
      };

      return res.json({
        success: true,
        message: 'Profile image updated successfully',
        data: formattedUser,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async removeProfileImage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { profileImage: '' },
        { new: true }
      ).select('-passwordHash');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const formattedUser = {
        id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneNumberVerified: user.phoneNumberVerified,
        profileImage: '',
        authMethods: user.authMethods,
      };

      return res.json({
        success: true,
        message: 'Profile image removed successfully',
        data: formattedUser,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  private static getBMIData(heightCm: number, weightKg: number) {
    if (!heightCm || !weightKg) return { bmi: 22.5, category: 'Normal' };
    const hM = heightCm / 100;
    const bmi = Math.round((weightKg / (hM * hM)) * 10) / 10;
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    return { bmi, category };
  }

  public static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const profile = await UserProfile.findOne({ userId }).populate('regionId');
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }
      const bmiData = ProfileController.getBMIData(profile.heightCm, profile.weightKg);
      const profileObj = profile.toObject();
      return res.json({
        success: true,
        data: {
          ...profileObj,
          bmi: bmiData.bmi,
          bmiCategory: bmiData.category,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const {
        gender,
        heightCm,
        weightKg,
        activityLevel,
        fitnessGoal,
        targetWeightKg,
        dietType,
        weeklyDietSchedule,
        allergies,
        foodPreferences,
        foodDislikes,
        regionId,
        dateOfBirth,
      } = req.body;

      // Validate region
      let selectedRegionId = regionId;
      if (!selectedRegionId) {
        const defaultRegion = await Region.findOne({ isActive: true });
        selectedRegionId = defaultRegion ? defaultRegion._id : null;
      }

      const age = 28;
      const nutritionTargets = NutritionService.calculateTargets({
        gender: gender || 'male',
        age,
        weightKg: Number(weightKg) || 70,
        heightCm: Number(heightCm) || 172,
        activityLevel: activityLevel || 'moderate',
        fitnessGoal: fitnessGoal || 'weight_loss',
      });

      let profile = await UserProfile.findOne({ userId });

      if (profile) {
        profile.gender = gender || profile.gender;
        profile.heightCm = Number(heightCm) || profile.heightCm;
        profile.weightKg = Number(weightKg) || profile.weightKg;
        profile.activityLevel = activityLevel || profile.activityLevel;
        profile.fitnessGoal = fitnessGoal || profile.fitnessGoal;
        profile.targetWeightKg = Number(targetWeightKg) || profile.targetWeightKg;
        profile.dietType = dietType || profile.dietType;
        if (weeklyDietSchedule) profile.weeklyDietSchedule = weeklyDietSchedule;
        profile.allergies = Array.isArray(allergies) ? allergies : profile.allergies;
        profile.foodPreferences = Array.isArray(foodPreferences) ? foodPreferences : profile.foodPreferences;
        profile.foodDislikes = Array.isArray(foodDislikes) ? foodDislikes : profile.foodDislikes;
        profile.dailyCalorieTarget = nutritionTargets.dailyCalorieTarget;
        profile.dailyProteinTarget = nutritionTargets.dailyProteinTarget;
        profile.dailyCarbsTarget = nutritionTargets.dailyCarbsTarget;
        profile.dailyFatTarget = nutritionTargets.dailyFatTarget;
        if (selectedRegionId) profile.regionId = selectedRegionId;
        if (dateOfBirth) profile.dateOfBirth = new Date(dateOfBirth);

        await profile.save();
      } else {
        profile = new UserProfile({
          userId,
          gender: gender || 'male',
          heightCm: Number(heightCm) || 172,
          weightKg: Number(weightKg) || 70,
          activityLevel: activityLevel || 'moderate',
          fitnessGoal: fitnessGoal || 'weight_loss',
          targetWeightKg: Number(targetWeightKg) || 65,
          dietType: dietType || 'veg',
          weeklyDietSchedule: weeklyDietSchedule || {
            monday: 'veg',
            tuesday: 'non_veg',
            wednesday: 'non_veg',
            thursday: 'veg',
            friday: 'non_veg',
            saturday: 'veg',
            sunday: 'non_veg',
          },
          allergies: allergies || [],
          foodPreferences: foodPreferences || [],
          foodDislikes: foodDislikes || [],
          dailyCalorieTarget: nutritionTargets.dailyCalorieTarget,
          dailyProteinTarget: nutritionTargets.dailyProteinTarget,
          dailyCarbsTarget: nutritionTargets.dailyCarbsTarget,
          dailyFatTarget: nutritionTargets.dailyFatTarget,
          regionId: selectedRegionId,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        });
        await profile.save();
      }

      const populated = await UserProfile.findById(profile._id).populate('regionId');
      const bmiData = ProfileController.getBMIData(profile.heightCm, profile.weightKg);

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          ...populated?.toObject(),
          bmi: bmiData.bmi,
          bmiCategory: bmiData.category,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getDietSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const profile = await UserProfile.findOne({ userId });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      const defaultSchedule = {
        monday: 'veg',
        tuesday: 'non_veg',
        wednesday: 'non_veg',
        thursday: 'veg',
        friday: 'non_veg',
        saturday: 'veg',
        sunday: 'non_veg',
      };

      return res.json({
        success: true,
        data: {
          defaultDietType: profile.dietType,
          weeklyDietSchedule: profile.weeklyDietSchedule || defaultSchedule,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateDietSchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { weeklyDietSchedule, defaultDietType } = req.body;

      const profile = await UserProfile.findOne({ userId });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      if (weeklyDietSchedule) {
        profile.weeklyDietSchedule = weeklyDietSchedule;
      }
      if (defaultDietType) {
        profile.dietType = defaultDietType;
      }

      await profile.save();

      return res.json({
        success: true,
        message: 'Weekly diet schedule saved successfully',
        data: {
          defaultDietType: profile.dietType,
          weeklyDietSchedule: profile.weeklyDietSchedule,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateLocation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id;
      const { latitude, longitude, accuracy, permissionStatus, source = 'gps', manualRegionId } = req.body;

      let profile = await UserProfile.findOne({ userId });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      const LocationService = (await import('../services/locationService.js')).LocationService;
      const RegionModel = (await import('../models/Region.js')).Region;

      const previousRegionId = profile.regionId ? profile.regionId.toString() : null;
      let matchedRegion: any = null;
      let detectedCity = '';
      let detectedState = '';
      let detectedCountry = 'India';
      let distanceKm = 0;

      if (source === 'manual' && manualRegionId) {
        matchedRegion = await RegionModel.findById(manualRegionId);
        if (!matchedRegion) {
          return res.status(404).json({ success: false, message: 'Selected region not found' });
        }
        detectedCity = matchedRegion.city;
        detectedState = matchedRegion.state;
        detectedCountry = matchedRegion.country;
      } else {
        if (latitude === undefined || longitude === undefined) {
          return res.status(400).json({ success: false, message: 'Latitude and Longitude are required for GPS location detection' });
        }

        if (!LocationService.validateCoordinates(Number(latitude), Number(longitude))) {
          return res.status(400).json({ success: false, message: 'Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.' });
        }

        const matchResult = await LocationService.matchRegionFromCoordinates(Number(latitude), Number(longitude));
        matchedRegion = matchResult.matchedRegion;
        detectedCity = matchResult.detectedCity;
        detectedState = matchResult.detectedState;
        detectedCountry = matchResult.detectedCountry;
        distanceKm = matchResult.distanceKm;

        profile.currentLatitude = Number(latitude);
        profile.currentLongitude = Number(longitude);
        profile.locationAccuracy = Number(accuracy) || 10;
        profile.locationPermissionStatus = permissionStatus || 'granted';
      }

      const newRegionId = matchedRegion._id.toString();
      const isRegionChanged = Boolean(previousRegionId && previousRegionId !== newRegionId);

      profile.regionId = matchedRegion._id as any;
      profile.locationUpdatedAt = new Date();

      profile.location = {
        latitude: source === 'gps' ? Number(latitude) : profile.currentLatitude,
        longitude: source === 'gps' ? Number(longitude) : profile.currentLongitude,
        accuracy: source === 'gps' ? (Number(accuracy) || 10) : profile.locationAccuracy,
        city: detectedCity,
        state: detectedState,
        country: detectedCountry,
        regionId: matchedRegion._id as any,
        source: source === 'manual' ? 'manual' : 'gps',
        updatedAt: new Date(),
      };

      await profile.save();

      const populatedProfile = await UserProfile.findById(profile._id).populate('regionId');

      return res.json({
        success: true,
        message: source === 'manual' ? 'Region updated manually' : 'Device location updated and region matched successfully',
        data: {
          profile: populatedProfile,
          matchedRegion,
          detectedCity,
          detectedState,
          detectedCountry,
          distanceKm,
          isRegionChanged,
          previousRegionId,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
