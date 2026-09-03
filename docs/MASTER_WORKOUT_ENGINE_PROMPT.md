# NUTRIREGION — MASTER WORKOUT ENGINE PROMPT & ARCHITECTURE SPECIFICATION

This document represents the master prompt, system architecture rules, and algorithm definitions for the **NutriRegion Workout Intelligence Engine**.

---

## 1. System Overview & Core Requirements

The Workout Intelligence Engine generates, organizes, rotates, and personalizes resistance-training, strength, hypertrophy, conditioning, mobility, cardio, home, gym, and bodyweight workouts.

Key Architectural Capabilities:
- Distinguishes **Available Exercise Pool** from **Today's Actual Session**.
- Supports single-muscle, 2-muscle, 3-muscle, and full-body splits.
- Enforces strict equipment filtering (e.g. `Bodyweight` only never generates gym hardware).
- Computes **"What Should I Train Tomorrow?"** recommendations based on recovery and trained muscles.
- Adapts set/rep/rest ranges according to goals (hypertrophy, strength, fat loss, general fitness) and ACSM guidelines.

---

## 2. API Response Schema Specification

```json
{
  "workoutPlan": {
    "workoutId": "custom_plan_123",
    "title": "CHEST + TRICEPS ROUTINE",
    "targetDay": "monday",
    "selectedMuscles": ["chest", "triceps"],
    "splitType": "two_muscle",
    "focusArea": "CHEST + TRICEPS",
    "goal": "hypertrophy",
    "difficulty": "intermediate",
    "estimatedDurationMin": 45,
    "estimatedCaloriesBurn": 280,
    "calorieEstimateType": "estimated",
    "selectionReasoning": "Targeted session balancing chest and triceps compound & isolation movements.",
    "exercisePool": {
      "primaryMuscle": [
        { "exerciseId": "ex_1", "name": "Barbell Bench Press", "primaryMuscle": "chest" },
        { "exerciseId": "ex_2", "name": "Incline Dumbbell Press", "primaryMuscle": "chest" },
        { "exerciseId": "ex_3", "name": "Dumbbell Bench Press", "primaryMuscle": "chest" },
        { "exerciseId": "ex_4", "name": "Machine Chest Press", "primaryMuscle": "chest" },
        { "exerciseId": "ex_5", "name": "Cable Chest Fly", "primaryMuscle": "chest" },
        { "exerciseId": "ex_6", "name": "Pec Deck", "primaryMuscle": "chest" }
      ],
      "secondaryMuscles": [
        { "exerciseId": "ex_7", "name": "Cable Triceps Pushdown", "primaryMuscle": "triceps" },
        { "exerciseId": "ex_8", "name": "Overhead Cable Extension", "primaryMuscle": "triceps" },
        { "exerciseId": "ex_9", "name": "EZ-Bar Skull Crusher", "primaryMuscle": "triceps" },
        { "exerciseId": "ex_10", "name": "Close-Grip Bench Press", "primaryMuscle": "triceps" }
      ]
    },
    "actualSession": [
      {
        "exerciseId": "ex_1",
        "name": "Barbell Bench Press",
        "primaryMuscle": "chest",
        "secondaryMuscles": ["triceps", "front_delts"],
        "equipment": ["Barbell", "Bench"],
        "difficulty": "intermediate",
        "sets": 3,
        "reps": 10,
        "targetReps": "8-12",
        "restSec": 60,
        "targetEngagementPercent": 85,
        "instructions": ["Lower barbell to mid-chest under control.", "Drive up firmly."]
      }
    ],
    "nextWorkoutRecommendation": {
      "recommended": true,
      "reason": "You trained Chest & Triceps today. Recommend Back & Biceps tomorrow for optimal recovery.",
      "focusArea": "BACK + BICEPS",
      "muscles": ["back", "biceps"]
    },
    "weeklyBalance": {
      "chest": 3,
      "back": 2,
      "shoulders": 1,
      "biceps": 2,
      "triceps": 3,
      "quads": 2,
      "hamstrings": 2,
      "glutes": 1,
      "calves": 1,
      "core": 2
    }
  }
}
```

---

## 3. Tomorrow Recommendation & Rotation Engine

When a workout is completed:
1. Save `todayWorkout.primaryMuscles` and `todayWorkout.secondaryMuscles`.
2. Compute opposing / unworked muscle groups for tomorrow:
   - If **Chest + Triceps** completed today -> Recommend **Back + Biceps** tomorrow.
   - If **Back + Biceps** completed today -> Recommend **Legs (Quads / Hamstrings / Glutes)** tomorrow.
   - If **Legs** completed today -> Recommend **Shoulders + Core** or **Chest + Triceps** tomorrow.
3. Update user workout history and muscle exposure breakdown.
