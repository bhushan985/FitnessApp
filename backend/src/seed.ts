import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { UserProfile } from './models/UserProfile.js';
import { Region } from './models/Region.js';
import { Food } from './models/Food.js';
import { FoodRegion } from './models/FoodRegion.js';
import { WorkoutPlan } from './models/WorkoutPlan.js';
import { Exercise } from './models/Exercise.js';
import { MembershipPlan } from './models/MembershipPlan.js';
import { Trainer } from './models/Trainer.js';
import { TrainerAssignment } from './models/TrainerAssignment.js';
import { Subscription } from './models/Subscription.js';
import { Recipe } from './models/Recipe.js';
import { SeedExercisesService } from './services/seedExercisesService.js';
import { connectDB, closeDB } from './config/db.js';


export const seedDatabase = async () => {
  console.log('--- Starting Seed Data Script ---');
  await SeedExercisesService.seedAllExercises();


  // Clear existing
  await User.deleteMany({});
  await UserProfile.deleteMany({});
  await Region.deleteMany({});
  await Food.deleteMany({});
  await FoodRegion.deleteMany({});
  await WorkoutPlan.deleteMany({});
  await Exercise.deleteMany({});
  await MembershipPlan.deleteMany({});
  await Trainer.deleteMany({});
  await TrainerAssignment.deleteMany({});
  await Recipe.deleteMany({});


  // 1. Seed Regions with GeoJSON Center Coordinates
  const regionsData = [
    { country: 'India', state: 'Maharashtra', city: 'Mumbai', regionName: 'Mumbai Central', timezone: 'Asia/Kolkata', centerLocation: { type: 'Point', coordinates: [72.8777, 19.0760] } },
    { country: 'India', state: 'Maharashtra', city: 'Pune', regionName: 'Pune Urban', timezone: 'Asia/Kolkata', centerLocation: { type: 'Point', coordinates: [73.8567, 18.5204] } },
    { country: 'India', state: 'Maharashtra', city: 'Nagpur', regionName: 'Nagpur East', timezone: 'Asia/Kolkata', centerLocation: { type: 'Point', coordinates: [79.0882, 21.1458] } },
    { country: 'India', state: 'Maharashtra', city: 'Nashik', regionName: 'Nashik Valley', timezone: 'Asia/Kolkata', centerLocation: { type: 'Point', coordinates: [73.7898, 19.9975] } },
    { country: 'India', state: 'Delhi', city: 'New Delhi', regionName: 'Connaught Place', timezone: 'Asia/Kolkata', centerLocation: { type: 'Point', coordinates: [77.2090, 28.6139] } },
    { country: 'India', state: 'Gujarat', city: 'Ahmedabad', regionName: 'Ahmedabad Central', timezone: 'Asia/Kolkata', centerLocation: { type: 'Point', coordinates: [72.5714, 23.0225] } },
    { country: 'India', state: 'Karnataka', city: 'Bengaluru', regionName: 'Indiranagar', timezone: 'Asia/Kolkata', centerLocation: { type: 'Point', coordinates: [77.5946, 12.9716] } },
  ];

  const createdRegions = await Region.insertMany(regionsData);
  console.log(`Seeded ${createdRegions.length} Regions with GeoJSON coordinates.`);

  const puneRegion = createdRegions.find((r) => r.city === 'Pune') || createdRegions[1];

  // 2. Seed Users & Admin & Trainer User
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await User.create({
    name: 'Fitness Admin',
    email: 'admin@fitnessapp.com',
    passwordHash,
    role: 'admin',
    status: 'active',
    emailVerified: true,
  });

  const demoUser = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    passwordHash,
    role: 'user',
    status: 'active',
    emailVerified: true,
  });

  const trainerUser = await User.create({
    name: 'Vikram Singh (Coach)',
    email: 'vikram@fitnessapp.com',
    passwordHash,
    role: 'trainer',
    status: 'active',
    emailVerified: true,
  });

  console.log(`Seeded Users: Admin (${adminUser.email}), User (${demoUser.email}), Trainer (${trainerUser.email})`);

  // Demo User Profile
  await UserProfile.create({
    userId: demoUser._id,
    gender: 'male',
    heightCm: 175,
    weightKg: 78,
    activityLevel: 'moderate',
    fitnessGoal: 'weight_loss',
    targetWeightKg: 70,
    dietType: 'veg',
    weeklyDietSchedule: {
      monday: 'veg',
      tuesday: 'non_veg',
      wednesday: 'non_veg',
      thursday: 'veg',
      friday: 'non_veg',
      saturday: 'veg',
      sunday: 'non_veg',
    },
    allergies: ['Peanuts'],
    foodPreferences: ['Rice', 'Dal', 'Poha', 'Sprouts', 'Paneer'],
    foodDislikes: ['Bitter Gourd'],
    dailyCalorieTarget: 2100,
    dailyProteinTarget: 130,
    dailyCarbsTarget: 220,
    dailyFatTarget: 60,
    regionId: puneRegion._id,
    currentLatitude: 18.5204,
    currentLongitude: 73.8567,
    locationPermissionStatus: 'granted',
  });

  // Grant 30-Day Free Trial to demo user
  await Subscription.create({
    userId: demoUser._id,
    subscriptionStatus: 'trial',
    trialStartDate: new Date(),
    trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // 3. Seed Certified Trainer Profile
  const trainerProfile = await Trainer.create({
    userId: trainerUser._id,
    name: 'Vikram Singh',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'ACE Certified Elite Strength & Regional Indian Macro Nutrition Specialist with 8+ years of experience.',
    specialization: ['Weight Loss', 'Muscle Hypertrophy', 'Indian Diet Planning', 'HIIT'],
    certifications: ['ACE Certified Personal Trainer', 'Precision Nutrition Level 1'],
    experienceYears: 8,
    languages: ['Hindi', 'English', 'Marathi'],
    location: 'Pune / Mumbai Hubs',
    hourlyRate: 600,
    monthlyRate: 3499,
    rating: 4.9,
    status: 'active',
  });

  await TrainerAssignment.create({
    userId: demoUser._id,
    trainerId: trainerProfile._id,
    startDate: new Date(),
    status: 'active',
    notes: 'Focus on progressive overload and high-protein vegetarian regional meals.',
  });
  console.log(`Seeded Trainer Profile & Assignment for ${trainerProfile.name}`);

  // 4. Seed Membership Plans
  const membershipPlansData = [
    {
      name: 'Basic Access',
      description: 'Essential regional nutrition tracking and 5-slot daily meal plans',
      price: 299,
      currency: 'INR',
      billingPeriod: 'monthly',
      trialDays: 30,
      features: ['5-Slot Regional Meal Plans', 'Basic Workout Routines', '10 Snap Checks / Month', 'Progress Analytics'],
      limits: { snapCheckLimitPerMonth: 10, mealPlanGenerationsPerMonth: 30, workoutAccessLevel: 'basic' },
      trainerIncluded: false,
      AIAccess: true,
      isActive: true,
    },
    {
      name: 'Pro Fitness',
      description: 'Full AI meal customizer, Snap Check meal scanner & complete workout library',
      price: 599,
      currency: 'INR',
      billingPeriod: 'monthly',
      trialDays: 30,
      features: [
        'Unlimited Regional Meal Plans',
        'Unlimited Snap Check Scans',
        'Full Workout Media Library',
        'Macro Goal Customizer',
        'Daily Veg / Non-Veg Switcher',
      ],
      limits: { snapCheckLimitPerMonth: 100, mealPlanGenerationsPerMonth: 100, workoutAccessLevel: 'pro' },
      trainerIncluded: false,
      AIAccess: true,
      isActive: true,
    },
    {
      name: 'Personal Trainer VIP',
      description: 'Dedicated personal trainer, custom workout & diet programming with priority support',
      price: 2499,
      currency: 'INR',
      billingPeriod: 'monthly',
      trialDays: 30,
      features: [
        'Assigned Certified Personal Trainer',
        'Custom Trainer Workout & Meal Plans',
        'Direct Trainer Notes & Guidance',
        'All Pro Features Included',
        'Priority 24/7 AI Support',
      ],
      limits: { snapCheckLimitPerMonth: 999, mealPlanGenerationsPerMonth: 999, workoutAccessLevel: 'unlimited' },
      trainerIncluded: true,
      trainerSessions: 4,
      AIAccess: true,
      prioritySupport: true,
      isActive: true,
    },
  ];

  await MembershipPlan.insertMany(membershipPlansData);
  console.log(`Seeded ${membershipPlansData.length} Membership Plans.`);

  // 5. Seed Exercises Library via SeedExercisesService
  const seededCount = await SeedExercisesService.seedAllExercises();
  console.log(`Seeded ${seededCount} Exercises into NutriRegion Exercise Studio.`);



  // 6. Seed Workout Plans
  const workoutPlansData = [
    {
      title: 'Chest & Triceps Hypertrophy',
      targetDay: 'monday',
      focusArea: 'Chest + Triceps',
      estimatedDurationMin: 45,
      totalCaloriesBurn: 340,
      difficulty: 'intermediate',
      isActive: true,
      exercises: [
        { name: 'Barbell Bench Press', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell & Bench', difficulty: 'intermediate' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 12, restSec: 60, equipment: 'Dumbbells', difficulty: 'intermediate' },
        { name: 'Tricep Rope Pushdowns', sets: 3, reps: 15, restSec: 45, equipment: 'Cable Machine', difficulty: 'beginner' },
        { name: 'Dips / Diamond Pushups', sets: 3, reps: 12, restSec: 45, equipment: 'Bodyweight', difficulty: 'intermediate' },
      ],
    },
    {
      title: 'Back & Biceps Strength',
      targetDay: 'tuesday',
      focusArea: 'Back + Biceps',
      estimatedDurationMin: 50,
      totalCaloriesBurn: 360,
      difficulty: 'intermediate',
      isActive: true,
      exercises: [
        { name: 'Lat Pulldowns', sets: 4, reps: 10, restSec: 60, equipment: 'Cable Machine', difficulty: 'beginner' },
        { name: 'Bent-Over Barbell Rows', sets: 3, reps: 10, restSec: 60, equipment: 'Barbell', difficulty: 'intermediate' },
        { name: 'Dumbbell Bicep Curls', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbells', difficulty: 'beginner' },
        { name: 'Hammer Curls', sets: 3, reps: 12, restSec: 45, equipment: 'Dumbbells', difficulty: 'beginner' },
      ],
    },
    {
      title: 'Legs & Core Power',
      targetDay: 'wednesday',
      focusArea: 'Quads + Glutes + Abs',
      estimatedDurationMin: 45,
      totalCaloriesBurn: 390,
      difficulty: 'advanced',
      isActive: true,
      exercises: [
        { name: 'Barbell Back Squats', sets: 4, reps: 8, restSec: 90, equipment: 'Squat Rack', difficulty: 'advanced' },
        { name: 'Dumbbell Lunges', sets: 3, reps: 12, restSec: 60, equipment: 'Dumbbells', difficulty: 'intermediate' },
        { name: 'Leg Press', sets: 3, reps: 12, restSec: 60, equipment: 'Leg Press Machine', difficulty: 'intermediate' },
        { name: 'Hanging Leg Raises', sets: 3, reps: 15, restSec: 45, equipment: 'Pull-up Bar', difficulty: 'intermediate' },
      ],
    },
    {
      title: 'Shoulders & Arms Sculpt',
      targetDay: 'thursday',
      focusArea: 'Deltoids + Arms',
      estimatedDurationMin: 40,
      totalCaloriesBurn: 310,
      difficulty: 'intermediate',
      isActive: true,
      exercises: [
        { name: 'Overhead Dumbbell Press', sets: 4, reps: 10, restSec: 60, equipment: 'Dumbbells', difficulty: 'intermediate' },
        { name: 'Lateral Raises', sets: 3, reps: 15, restSec: 45, equipment: 'Dumbbells', difficulty: 'beginner' },
        { name: 'Skull Crushers', sets: 3, reps: 12, restSec: 45, equipment: 'EZ Bar', difficulty: 'intermediate' },
        { name: 'Preacher Curls', sets: 3, reps: 12, restSec: 45, equipment: 'EZ Bar Bench', difficulty: 'intermediate' },
      ],
    },
    {
      title: 'Full Body HIIT Fat Loss',
      targetDay: 'friday',
      focusArea: 'Full Body + Cardio',
      estimatedDurationMin: 35,
      totalCaloriesBurn: 420,
      difficulty: 'intermediate',
      isActive: true,
      exercises: [
        { name: 'Kettlebell Swings', sets: 4, reps: 20, restSec: 30, equipment: 'Kettlebell', difficulty: 'intermediate' },
        { name: 'Burpees', sets: 3, reps: 15, restSec: 30, equipment: 'Bodyweight', difficulty: 'intermediate' },
        { name: 'Mountain Climbers', sets: 3, reps: 30, restSec: 30, equipment: 'Bodyweight', difficulty: 'beginner' },
        { name: 'Plank Hold', sets: 3, reps: 1, durationSec: 60, restSec: 30, equipment: 'Mat', difficulty: 'beginner' },
      ],
    },
    {
      title: 'Active Mobility & Yoga Recovery',
      targetDay: 'saturday',
      focusArea: 'Flexibility + Core',
      estimatedDurationMin: 30,
      totalCaloriesBurn: 180,
      difficulty: 'beginner',
      isActive: true,
      exercises: [
        { name: 'Surya Namaskar (Sun Salutation)', sets: 5, reps: 1, restSec: 30, equipment: 'Yoga Mat', difficulty: 'beginner' },
        { name: 'Cat-Cow Stretch', sets: 3, reps: 10, restSec: 30, equipment: 'Yoga Mat', difficulty: 'beginner' },
        { name: 'Bird-Dog Core Stability', sets: 3, reps: 12, restSec: 30, equipment: 'Yoga Mat', difficulty: 'beginner' },
      ],
    },
    {
      title: 'Rest & Foam Rolling Active Recovery',
      targetDay: 'sunday',
      focusArea: 'Recovery',
      estimatedDurationMin: 25,
      totalCaloriesBurn: 150,
      difficulty: 'beginner',
      isActive: true,
      exercises: [
        { name: 'Hamstring & Quad Foam Rolling', sets: 3, reps: 1, durationSec: 90, restSec: 30, equipment: 'Foam Roller', difficulty: 'beginner' },
        { name: 'Deep Breathing Meditation', sets: 1, reps: 1, durationSec: 600, restSec: 0, equipment: 'Quiet Space', difficulty: 'beginner' },
      ],
    },
  ];

  await WorkoutPlan.insertMany(workoutPlansData);
  console.log(`Seeded ${workoutPlansData.length} Workout Plans.`);

  // 7. Seed Comprehensive Foods
  const foodsData = [
    {
      name: 'Kanda Poha',
      localNames: ['Batata Poha', 'Poha with Peanuts'],
      category: 'breakfast',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 280, proteinG: 6, carbohydratesG: 48, fatG: 8, fiberG: 4, sugarG: 3 },
      ingredients: ['Flattened rice', 'Onions', 'Potatoes', 'Mustard seeds', 'Curry leaves', 'Turmeric', 'Lemon'],
      preparationMethod: 'Soak poha, sauté onions and potatoes with spices, mix in poha and steam for 3 mins.',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Rava Upma',
      localNames: ['Upma', 'Suji Upma'],
      category: 'breakfast',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 250, proteinG: 7, carbohydratesG: 42, fatG: 7, fiberG: 3, sugarG: 2 },
      ingredients: ['Semolina', 'Vegetables', 'Ghee', 'Mustard seeds', 'Ginger', 'Green chillies'],
      preparationMethod: 'Roast semolina, sauté tempered veggies, pour boiling water and stir until fluffy.',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Idli Sambhar',
      localNames: ['Steamed Idli', 'Rice Idli'],
      category: 'breakfast',
      dietaryType: 'vegan',
      servingUnit: 'pieces',
      defaultServingSize: 180,
      nutrition: { calories: 210, proteinG: 8, carbohydratesG: 40, fatG: 2, fiberG: 5, sugarG: 2 },
      ingredients: ['Fermented rice batter', 'Urad dal', 'Toor dal', 'Mixed vegetables', 'Sambhar spices'],
      preparationMethod: 'Steam fermented batter in molds, serve hot with vegetable sambhar and coconut chutney.',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Dal Tadka with Whole Wheat Chapati',
      localNames: ['Dal Roti', 'Yellow Dal'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'meal combo',
      defaultServingSize: 350,
      nutrition: { calories: 420, proteinG: 18, carbohydratesG: 68, fatG: 10, fiberG: 9, sugarG: 3 },
      ingredients: ['Toor dal', 'Tomatoes', 'Garlic', 'Ghee', 'Whole wheat flour', 'Cumin'],
      preparationMethod: 'Cook dal in pressure cooker, temper with garlic ghee tadka, serve with 2 whole wheat chapatis.',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Rajma Chawal',
      localNames: ['Kidney Bean Curry with Steamed Rice'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'plate',
      defaultServingSize: 400,
      nutrition: { calories: 480, proteinG: 17, carbohydratesG: 82, fatG: 8, fiberG: 11, sugarG: 4 },
      ingredients: ['Red kidney beans', 'Basmati rice', 'Tomato onion gravy', 'Garam masala'],
      preparationMethod: 'Soak & boil rajma, simmer in spiced onion tomato gravy, serve over hot basmati rice.',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Paneer Tikka with Green Chutney',
      localNames: ['Grilled Paneer', 'Tandoori Paneer'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 220,
      nutrition: { calories: 380, proteinG: 22, carbohydratesG: 12, fatG: 26, fiberG: 3, sugarG: 2 },
      ingredients: ['Cottage cheese (Paneer)', 'Yogurt', 'Bell peppers', 'Ajwain', 'Mustard oil'],
      preparationMethod: 'Marinate paneer cubes in spiced hung curd, skewer with peppers, grill until charred.',
      imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'High-Protein Sprouts Chaat',
      localNames: ['Moong Sprouts Salad', 'Usal Salad'],
      category: 'snack',
      dietaryType: 'vegan',
      servingUnit: 'bowl',
      defaultServingSize: 180,
      nutrition: { calories: 190, proteinG: 12, carbohydratesG: 32, fatG: 2, fiberG: 8, sugarG: 4 },
      ingredients: ['Sprouted green moong', 'Chopped cucumber', 'Tomatoes', 'Chaat masala', 'Lemon juice'],
      preparationMethod: 'Steam sprouts lightly, toss with fresh veggies, lemon juice, cilantro, and chaat masala.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Grilled Chicken Breast with Brown Rice',
      localNames: ['Murgh Tikka Meal', 'Herb Chicken Rice'],
      category: 'dinner',
      dietaryType: 'non_veg',
      servingUnit: 'plate',
      defaultServingSize: 350,
      nutrition: { calories: 460, proteinG: 42, carbohydratesG: 45, fatG: 10, fiberG: 4, sugarG: 1 },
      ingredients: ['Chicken breast', 'Brown rice', 'Garlic', 'Olive oil', 'Black pepper', 'Steamed broccoli'],
      preparationMethod: 'Marinate chicken breast with garlic pepper, pan sear in olive oil, serve with cooked brown rice.',
      imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Egg Bhurji with Whole Wheat Roti',
      localNames: ['Scrambled Eggs Indian Style'],
      category: 'dinner',
      dietaryType: 'egg',
      servingUnit: 'meal',
      defaultServingSize: 250,
      nutrition: { calories: 340, proteinG: 21, carbohydratesG: 28, fatG: 16, fiberG: 4, sugarG: 2 },
      ingredients: ['Whole eggs', 'Onions', 'Green chillies', 'Coriander', 'Wheat flour chapatis'],
      preparationMethod: 'Scramble eggs with sautéed onions, chillies, and spices. Serve hot with 2 chapatis.',
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Masala Oats with Vegetables',
      localNames: ['Veggie Oats', 'Oats Upma'],
      category: 'snack',
      dietaryType: 'vegan',
      servingUnit: 'bowl',
      defaultServingSize: 200,
      nutrition: { calories: 210, proteinG: 8, carbohydratesG: 36, fatG: 4, fiberG: 6, sugarG: 2 },
      ingredients: ['Rolled oats', 'Green peas', 'Carrots', 'Turmeric', 'Cumin'],
      preparationMethod: 'Cook rolled oats in water with diced vegetables and light seasoning until thick.',
      imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Soya Chunks Masala',
      localNames: ['Soya Bean Curry', 'Nutrela Soya'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 260, proteinG: 26, carbohydratesG: 24, fatG: 7, fiberG: 8, sugarG: 5 },
      ingredients: ['Soya chunks', 'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Turmeric', 'Garam masala'],
      preparationMethod: 'Boil soya chunks, squeeze out excess water, sauté with onion-tomato masala and spices.',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Besan Chilla',
      localNames: ['Gram Flour Chilla', 'Besan Cheela'],
      category: 'breakfast',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 180,
      nutrition: { calories: 290, proteinG: 14, carbohydratesG: 34, fatG: 11, fiberG: 7, sugarG: 4 },
      ingredients: ['Besan', 'Onions', 'Tomatoes', 'Green chillies', 'Coriander', 'Spices', 'Oil'],
      preparationMethod: 'Mix besan with vegetables and spices, prepare a smooth batter and cook on a lightly greased pan.',
      imageUrl: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Paneer Bhurji',
      localNames: ['Paneer Scramble', 'Masala Paneer'],
      category: 'breakfast',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 390, proteinG: 25, carbohydratesG: 10, fatG: 28, fiberG: 2, sugarG: 5 },
      ingredients: ['Paneer', 'Onions', 'Tomatoes', 'Capsicum', 'Green chillies', 'Turmeric', 'Garam masala'],
      preparationMethod: 'Crumble paneer and cook with sautéed onions, tomatoes, capsicum and Indian spices.',
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Matar Paneer',
      localNames: ['Peas Paneer', 'Green Peas Paneer Curry'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 340, proteinG: 18, carbohydratesG: 20, fatG: 22, fiberG: 5, sugarG: 7 },
      ingredients: ['Paneer', 'Green peas', 'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Spices'],
      preparationMethod: 'Prepare onion-tomato gravy, add peas and paneer, then simmer with spices.',
      imageUrl: 'https://images.unsplash.com/photo-1631452180775-7c1e1a4c5f3f?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Moong Dal',
      localNames: ['Yellow Moong Dal', 'Moong Dal Tadka'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 230, proteinG: 14, carbohydratesG: 34, fatG: 5, fiberG: 9, sugarG: 3 },
      ingredients: ['Moong dal', 'Tomatoes', 'Onions', 'Garlic', 'Cumin', 'Turmeric', 'Coriander'],
      preparationMethod: 'Pressure cook moong dal and finish with a tempering of cumin, garlic, onions and spices.',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Masoor Dal',
      localNames: ['Red Lentil Dal', 'Masoor Amti'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 240, proteinG: 15, carbohydratesG: 35, fatG: 5, fiberG: 9, sugarG: 3 },
      ingredients: ['Masoor dal', 'Tomatoes', 'Onions', 'Garlic', 'Turmeric', 'Cumin', 'Coriander'],
      preparationMethod: 'Cook masoor dal until soft and season with a traditional Indian tempering.',
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Chana Masala',
      localNames: ['Kala Chana Masala', 'Kabuli Chana Curry'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 310, proteinG: 15, carbohydratesG: 45, fatG: 8, fiberG: 12, sugarG: 7 },
      ingredients: ['Chickpeas', 'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Chana masala', 'Coriander'],
      preparationMethod: 'Cook soaked chickpeas and simmer them in an onion-tomato masala with spices.',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Kala Chana Usal',
      localNames: ['Black Chickpea Usal', 'Kala Chana Curry'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 290, proteinG: 16, carbohydratesG: 43, fatG: 6, fiberG: 11, sugarG: 5 },
      ingredients: ['Black chickpeas', 'Onions', 'Tomatoes', 'Coconut', 'Mustard seeds', 'Curry leaves', 'Spices'],
      preparationMethod: 'Cook soaked kala chana and prepare it with Maharashtrian-style tempering and spices.',
      imageUrl: 'https://images.unsplash.com/photo-1515543904379-3d757abe4c68?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Sprouted Moong Usal',
      localNames: ['Moong Sprouts Curry', 'Sprouts Usal'],
      category: 'breakfast',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 220, proteinG: 15, carbohydratesG: 32, fatG: 4, fiberG: 9, sugarG: 5 },
      ingredients: ['Moong sprouts', 'Onions', 'Tomatoes', 'Coconut', 'Mustard seeds', 'Curry leaves', 'Spices'],
      preparationMethod: 'Steam sprouts and cook with onions, tomatoes, spices and a light Maharashtrian tempering.',
      imageUrl: 'https://images.unsplash.com/photo-1515543904379-3d757abe4c68?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Peanut Chaat',
      localNames: ['Peanut Salad', 'Shengdana Chaat'],
      category: 'snack',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 100,
      nutrition: { calories: 320, proteinG: 14, carbohydratesG: 16, fatG: 25, fiberG: 6, sugarG: 4 },
      ingredients: ['Roasted peanuts', 'Onions', 'Tomatoes', 'Coriander', 'Lemon', 'Green chillies'],
      preparationMethod: 'Mix roasted peanuts with chopped vegetables, lemon juice and spices.',
      imageUrl: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Chicken Sukka',
      localNames: ['Chicken Suka', 'Konkani Chicken Sukka'],
      category: 'lunch',
      dietaryType: 'non_veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 360, proteinG: 48, carbohydratesG: 8, fatG: 16, fiberG: 3, sugarG: 2 },
      ingredients: ['Chicken', 'Onions', 'Fresh coconut', 'Ginger', 'Garlic', 'Curry leaves', 'Dry spices'],
      preparationMethod: 'Cook chicken with onion, coconut, spices and curry leaves until the mixture becomes dry and aromatic.',
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Chicken Curry',
      localNames: ['Indian Chicken Curry', 'Chicken Masala'],
      category: 'lunch',
      dietaryType: 'non_veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 330, proteinG: 46, carbohydratesG: 9, fatG: 13, fiberG: 2, sugarG: 4 },
      ingredients: ['Chicken', 'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Turmeric', 'Garam masala'],
      preparationMethod: 'Sauté chicken with onion-tomato masala and spices, then simmer until fully cooked.',
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Tandoori Chicken',
      localNames: ['Tandoori Murgh', 'Grilled Chicken'],
      category: 'dinner',
      dietaryType: 'non_veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 320, proteinG: 52, carbohydratesG: 6, fatG: 11, fiberG: 1, sugarG: 2 },
      ingredients: ['Chicken', 'Yogurt', 'Lemon', 'Ginger', 'Garlic', 'Tandoori spices'],
      preparationMethod: 'Marinate chicken in yogurt, lemon and spices, then grill or roast until cooked.',
      imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Chicken Tikka',
      localNames: ['Chicken Tikka Masala', 'Grilled Chicken Tikka'],
      category: 'snack',
      dietaryType: 'non_veg',
      servingUnit: 'grams',
      defaultServingSize: 150,
      nutrition: { calories: 260, proteinG: 40, carbohydratesG: 7, fatG: 8, fiberG: 1, sugarG: 2 },
      ingredients: ['Chicken breast', 'Yogurt', 'Lemon', 'Ginger', 'Garlic', 'Tandoori spices'],
      preparationMethod: 'Marinate chicken pieces in yogurt and spices, skewer and grill until lightly charred.',
      imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Boiled Eggs',
      localNames: ['Hard Boiled Eggs', 'Eggs'],
      category: 'breakfast',
      dietaryType: 'egg',
      servingUnit: 'grams',
      defaultServingSize: 100,
      nutrition: { calories: 155, proteinG: 13, carbohydratesG: 1, fatG: 11, fiberG: 0, sugarG: 1 },
      ingredients: ['Eggs', 'Water', 'Salt'],
      preparationMethod: 'Boil eggs in water until the whites and yolks are fully cooked.',
      imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Egg Bhurji',
      localNames: ['Anda Bhurji', 'Indian Scrambled Eggs'],
      category: 'breakfast',
      dietaryType: 'egg',
      servingUnit: 'grams',
      defaultServingSize: 180,
      nutrition: { calories: 280, proteinG: 20, carbohydratesG: 7, fatG: 19, fiberG: 2, sugarG: 4 },
      ingredients: ['Eggs', 'Onions', 'Tomatoes', 'Green chillies', 'Coriander', 'Turmeric', 'Oil'],
      preparationMethod: 'Sauté onions and tomatoes with spices, add beaten eggs and scramble until cooked.',
      imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Egg Omelette',
      localNames: ['Masala Omelette', 'Indian Omelette'],
      category: 'breakfast',
      dietaryType: 'egg',
      servingUnit: 'grams',
      defaultServingSize: 150,
      nutrition: { calories: 240, proteinG: 17, carbohydratesG: 5, fatG: 17, fiberG: 1, sugarG: 2 },
      ingredients: ['Eggs', 'Onions', 'Tomatoes', 'Green chillies', 'Coriander', 'Oil'],
      preparationMethod: 'Beat eggs with chopped vegetables and spices, then cook on a lightly greased pan.',
      imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Fish Curry',
      localNames: ['Indian Fish Curry', 'Maharashtrian Fish Curry'],
      category: 'lunch',
      dietaryType: 'non_veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 300, proteinG: 38, carbohydratesG: 8, fatG: 13, fiberG: 2, sugarG: 3 },
      ingredients: ['Fish', 'Coconut', 'Onions', 'Tomatoes', 'Turmeric', 'Chilli powder', 'Curry leaves'],
      preparationMethod: 'Prepare a spiced coconut-based curry and simmer fish pieces until tender.',
      imageUrl: 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Grilled Fish',
      localNames: ['Fish Tikka', 'Grilled Fish Fillet'],
      category: 'dinner',
      dietaryType: 'non_veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 280, proteinG: 42, carbohydratesG: 3, fatG: 11, fiberG: 0, sugarG: 1 },
      ingredients: ['Fish fillet', 'Lemon', 'Garlic', 'Black pepper', 'Turmeric', 'Oil'],
      preparationMethod: 'Marinate fish with lemon, garlic and spices, then grill until cooked.',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Rajma Masala',
      localNames: ['Kidney Bean Curry', 'Rajma'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 280, proteinG: 15, carbohydratesG: 43, fatG: 6, fiberG: 11, sugarG: 6 },
      ingredients: ['Kidney beans', 'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Cumin', 'Garam masala'],
      preparationMethod: 'Soak and pressure cook rajma, then simmer in onion-tomato masala.',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Dal Khichdi',
      localNames: ['Moong Dal Khichdi', 'Protein Khichdi'],
      category: 'lunch',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 300,
      nutrition: { calories: 330, proteinG: 14, carbohydratesG: 52, fatG: 8, fiberG: 7, sugarG: 3 },
      ingredients: ['Rice', 'Moong dal', 'Carrots', 'Peas', 'Turmeric', 'Cumin', 'Ghee'],
      preparationMethod: 'Pressure cook rice, dal and vegetables together with spices until soft.',
      imageUrl: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
    {
      name: 'Sprouts Chaat',
      localNames: ['Mixed Sprouts Salad', 'Protein Sprouts Chaat'],
      category: 'snack',
      dietaryType: 'veg',
      servingUnit: 'grams',
      defaultServingSize: 200,
      nutrition: { calories: 210, proteinG: 14, carbohydratesG: 30, fatG: 4, fiberG: 9, sugarG: 6 },
      ingredients: ['Moong sprouts', 'Chana sprouts', 'Onions', 'Tomatoes', 'Cucumber', 'Lemon', 'Coriander'],
      preparationMethod: 'Mix steamed sprouts with fresh vegetables, lemon juice and spices.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      source: 'internal',
      isActive: true,
    },
  ];

  const createdFoods = await Food.insertMany(foodsData);
  console.log(`Seeded ${createdFoods.length} Foods.`);

  // 8. Link Foods to Regions with FoodRegion
  const foodRegionEntries: any[] = [];
  for (const food of createdFoods) {
    for (const region of createdRegions) {
      let popularity = 8;
      let availability = 9;

      if (food.name.includes('Poha') && region.state === 'Maharashtra') popularity = 10;
      if (food.name.includes('Upma') && (region.state === 'Karnataka' || region.state === 'Maharashtra')) popularity = 10;
      if (food.name.includes('Rajma') && region.state === 'Delhi') popularity = 10;

      foodRegionEntries.push({
        foodId: food._id,
        regionId: region._id,
        availabilityScore: availability,
        popularityScore: popularity,
        seasonality: 'all_year',
        localName: food.localNames[0] || food.name,
        averagePrice: Math.round(40 + Math.random() * 80),
        isActive: true,
      });
    }
  }

  await FoodRegion.insertMany(foodRegionEntries);
  console.log(`Seeded ${foodRegionEntries.length} FoodRegion mappings.`);

  // 9. Seed Regional Recipes
  const recipesData = [
    {
      name: 'Chicken Biryani',
      slug: 'chicken-biryani',
      localNames: ['Hyderabadi Chicken Biryani', 'Murgh Biryani'],
      region: 'Hyderabad',
      cuisine: 'Hyderabadi',
      mealType: ['lunch', 'dinner'],
      dietaryType: 'non_veg',
      goalTags: ['high_protein', 'weight_gain', 'muscle_building'],
      servings: 2,
      ingredients: [
        { item: 'Chicken', amount: 300, unit: 'g', gramsEquivalent: 300 },
        { item: 'Basmati Rice', amount: 200, unit: 'g', gramsEquivalent: 200 },
        { item: 'Curd / Yogurt', amount: 70, unit: 'g', gramsEquivalent: 70 },
        { item: 'Onion', amount: 80, unit: 'g', gramsEquivalent: 80 },
        { item: 'Cooking Oil / Ghee', amount: 15, unit: 'g', gramsEquivalent: 15 },
      ],
      instructions: [
        'Marinate chicken in curd, ginger-garlic paste, mint, coriander, and biryani spices for 30 minutes.',
        'Parboil basmati rice with whole spices until 70% cooked.',
        'Layer marinated chicken and rice in heavy bottom pot.',
        'Seal and cook on low heat (Dum) for 25 minutes.',
        'Garnish with fried onions and serve hot with raita.',
      ],
      nutritionPerServing: {
        calories: 570,
        protein: 25.5,
        carbohydrates: 72,
        fat: 19.5,
        fiber: 4.5,
      },
      servingOptions: [{ unit: 'serving', grams: 300 }, { unit: 'plate', grams: 350 }],
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      isActive: true,
    },
    {
      name: 'Kanda Poha',
      slug: 'kanda-poha',
      localNames: ['Maharashtrian Poha', 'Pohe'],
      region: 'Maharashtra',
      cuisine: 'Maharashtrian',
      mealType: ['breakfast', 'snack'],
      dietaryType: 'veg',
      goalTags: ['weight_loss', 'low_calorie', 'quick_breakfast'],
      servings: 2,
      ingredients: [
        { item: 'Flattened Rice (Poha)', amount: 150, unit: 'g', gramsEquivalent: 150 },
        { item: 'Onions', amount: 80, unit: 'g', gramsEquivalent: 80 },
        { item: 'Peanuts', amount: 20, unit: 'g', gramsEquivalent: 20 },
        { item: 'Mustard Seeds & Curry Leaves', amount: 5, unit: 'g', gramsEquivalent: 5 },
        { item: 'Oil', amount: 10, unit: 'g', gramsEquivalent: 10 },
      ],
      instructions: [
        'Rinse poha in colander and drain excess water.',
        'Heat oil in pan, sauté mustard seeds, curry leaves, and peanuts until crunchy.',
        'Add chopped onions and green chillies, sauté until translucent.',
        'Add turmeric, salt, and drained poha. Mix gently on low flame for 3 minutes.',
        'Garnish with fresh coriander and lemon juice.',
      ],
      nutritionPerServing: {
        calories: 320,
        protein: 7,
        carbohydrates: 58,
        fat: 8,
        fiber: 4,
      },
      servingOptions: [{ unit: 'serving', grams: 250 }, { unit: 'bowl', grams: 250 }],
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
      rating: 4.7,
      isActive: true,
    },
    {
      name: 'Paneer Bhurji with Roti',
      slug: 'paneer-bhurji-roti',
      localNames: ['Paneer Scramble'],
      region: 'North India',
      cuisine: 'North Indian',
      mealType: ['breakfast', 'lunch', 'dinner'],
      dietaryType: 'veg',
      goalTags: ['high_protein', 'muscle_building'],
      servings: 1,
      ingredients: [
        { item: 'Crumble Paneer', amount: 150, unit: 'g', gramsEquivalent: 150 },
        { item: 'Whole Wheat Roti', amount: 2, unit: 'piece', gramsEquivalent: 80 },
        { item: 'Onion & Tomato', amount: 80, unit: 'g', gramsEquivalent: 80 },
        { item: 'Ghee', amount: 8, unit: 'g', gramsEquivalent: 8 },
      ],
      instructions: [
        'Sauté onions, tomatoes, and green chillies in ghee until soft.',
        'Add turmeric, red chilli, and garam masala.',
        'Fold in crumbled paneer and cook for 3 minutes.',
        'Serve with warm whole wheat rotis.',
      ],
      nutritionPerServing: {
        calories: 480,
        protein: 29,
        carbohydrates: 38,
        fat: 22,
        fiber: 5,
      },
      servingOptions: [{ unit: 'serving', grams: 310 }],
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
      rating: 4.9,
      isActive: true,
    },
  ];

  await Recipe.insertMany(recipesData);
  console.log(`Seeded ${recipesData.length} Regional Recipes.`);

  console.log('--- Database Seeding Completed Successfully ---');
};


if (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js')) {
  connectDB().then(async () => {
    await seedDatabase();
    await closeDB();
    process.exit(0);
  });
}
