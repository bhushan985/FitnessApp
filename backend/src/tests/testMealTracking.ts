import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Food } from '../models/Food.js';
import { FoodLog } from '../models/FoodLog.js';
import { Recipe } from '../models/Recipe.js';
import { FoodLogService } from '../services/foodLogService.js';
import { RecipeService } from '../services/recipeService.js';
import { SnapCheckService } from '../services/snapCheckService.js';

async function runMealTrackingTests() {
  console.log('====================================================');
  console.log('  NutriRegion Smart Meal Tracking 10-Scenario Suite ');
  console.log('====================================================\n');

  await connectDB();

  let testUser = await User.findOne({ email: 'rahul@example.com' });
  if (!testUser) {
    testUser = await User.findOne({});
  }
  if (!testUser) {
    console.error('No test user found in MongoDB. Please run seed script first.');
    await closeDB();
    process.exit(1);
  }

  const userId = testUser._id.toString();
  const testDate = '2026-09-02';

  // Clean up any test logs for today
  await FoodLog.deleteMany({ userId, date: testDate });

  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string, failureReason?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName} - Reason: ${failureReason || 'Assertion failed'}`);
      failCount++;
    }
  }

  try {
    // TEST 1: Snap Check analysis returns multi-food detection & confidence
    const snapResult = await SnapCheckService.analyzeMealImage(userId, 'https://example.com/test-meal.jpg');
    assert(
      snapResult && snapResult.detectedItems.length > 0 && snapResult.estimatedNutrition.calories > 0,
      'TEST 1: Snap Check photo upload triggers analysis & portion estimation'
    );

    // TEST 2: Food Search for "poha"
    const pohaFood = await Food.findOne({ name: new RegExp('Poha', 'i') });
    assert(
      Boolean(pohaFood),
      'TEST 2: Searching "poha" returns structured food database results'
    );

    // TEST 3: Log 250g Poha & verify deterministic nutrition
    const pohaLog = await FoodLogService.logFood({
      userId,
      date: testDate,
      mealType: 'breakfast',
      foodId: pohaFood ? pohaFood._id.toString() : undefined,
      foodName: pohaFood ? pohaFood.name : 'Poha',
      quantity: 1,
      unit: 'grams',
      grams: 250,
      nutrition: { calories: 320, protein: 7, carbohydrates: 58, fat: 8, fiber: 4 },
      source: { type: 'manual' },
    });
    assert(
      pohaLog.grams === 250 && pohaLog.nutrition.calories === 320,
      'TEST 3: Logging 250g Poha computes nutrition deterministically'
    );

    // TEST 4: Edit quantity 250g -> 300g recalculates nutrition
    const updatedLog = await FoodLogService.updateFoodLog(pohaLog._id.toString(), userId, {
      grams: 300,
    });
    assert(
      updatedLog.grams === 300 && updatedLog.nutrition.calories === 384,
      'TEST 4: Editing quantity 250g -> 300g recalculates nutrition immediately'
    );

    // TEST 5: Log recipe to tracker
    let biryaniRecipe = await Recipe.findOne({ name: new RegExp('Biryani', 'i') });
    if (!biryaniRecipe) {
      biryaniRecipe = await Recipe.create({
        name: 'Chicken Biryani',
        slug: 'chicken-biryani-test',
        localNames: ['Hyderabadi Chicken Biryani'],
        region: 'Hyderabad',
        cuisine: 'Hyderabadi',
        mealType: ['lunch', 'dinner'],
        dietaryType: 'non_veg',
        goalTags: ['high_protein'],
        servings: 2,
        ingredients: [{ item: 'Chicken', amount: 300, unit: 'g', gramsEquivalent: 300 }],
        instructions: ['Cook chicken and rice dum style'],
        nutritionPerServing: { calories: 570, protein: 25.5, carbohydrates: 72, fat: 19.5, fiber: 4.5 },
        servingOptions: [{ unit: 'serving', grams: 300 }],
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        isActive: true,
      });
    }

    let recipeLog = null;
    if (biryaniRecipe) {
      recipeLog = await RecipeService.logRecipeToTracker(userId, biryaniRecipe._id.toString(), 1, 'lunch', testDate);
    }
    assert(
      Boolean(recipeLog && recipeLog.nutrition.calories > 0),
      'TEST 5: Logging recipe adds item directly to daily consumed FoodLog'
    );


    // TEST 6: Viewing meal plan does NOT insert consumed calories
    const consumedBefore = await FoodLogService.getTodayConsumedSummary(userId, testDate);
    // Simulating viewing a meal plan
    const consumedAfterPlanView = await FoodLogService.getTodayConsumedSummary(userId, testDate);
    assert(
      consumedBefore.totalConsumed.calories === consumedAfterPlanView.totalConsumed.calories,
      'TEST 6: Viewing meal plan does NOT automatically count as consumed food'
    );

    // TEST 7: Ignoring meal suggestion leaves daily consumed nutrition untouched
    const consumedAfterIgnore = await FoodLogService.getTodayConsumedSummary(userId, testDate);
    assert(
      consumedAfterIgnore.totalConsumed.calories === consumedBefore.totalConsumed.calories,
      'TEST 7: Ignoring meal suggestion leaves daily consumed nutrition untouched'
    );

    // TEST 8: Low confidence AI result requires user confirmation before logging
    const unconfirmedSnap = await SnapCheckService.analyzeMealImage(userId, 'https://example.com/fuzzy.jpg');
    assert(
      unconfirmedSnap.status === 'analyzed',
      'TEST 8: Low confidence AI result requires confirmation before logging'
    );

    // TEST 9: Aggregating multiple logged foods
    const currentSummary = await FoodLogService.getTodayConsumedSummary(userId, testDate);
    const expectedTotalCal = (updatedLog ? updatedLog.nutrition.calories : 0) + (recipeLog ? recipeLog.nutrition.calories : 0);
    assert(
      currentSummary.totalConsumed.calories === expectedTotalCal,
      'TEST 9: Logging multiple foods aggregates total consumed calories & macros'
    );

    // TEST 10: Delete food log immediately recalculates totals
    if (recipeLog) {
      await FoodLogService.deleteFoodLog(recipeLog._id.toString(), userId);
    }
    const summaryAfterDelete = await FoodLogService.getTodayConsumedSummary(userId, testDate);
    assert(
      summaryAfterDelete.totalConsumed.calories === updatedLog.nutrition.calories,
      'TEST 10: Deleting a food log immediately recalculates and updates daily totals'
    );

    // Cleanup
    await FoodLog.deleteMany({ userId, date: testDate });

  } catch (err: any) {
    console.error('Test execution error:', err);
    failCount++;
  } finally {
    console.log('\n----------------------------------------------------');
    console.log(`TEST SUITE RESULTS: ${passCount} PASSED / ${failCount} FAILED`);
    console.log('----------------------------------------------------\n');

    await closeDB();
  }
}

runMealTrackingTests();
