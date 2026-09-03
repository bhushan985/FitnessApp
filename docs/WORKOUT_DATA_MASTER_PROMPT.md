# NutriRegion Workout Data Master Prompt

This document contains the **Master Prompt** designed for generating production-ready workout plans, exercises, set/rep schemes, rest periods, and calorie estimates tailored for the **NutriRegion Fitness Application**.

---

## 📋 How to Use This Master Prompt

1. Copy the **Master Prompt** below into ChatGPT, Claude, Gemini, or any LLM.
2. Replace the **Input Variables** inside the prompt (e.g., `[TARGET_GOAL]`, `[FOCUS_AREA]`, `[AVAILABLE_EQUIPMENT]`) with your specific needs.
3. The AI model will output valid JSON formatted precisely for NutriRegion's MongoDB database (`WorkoutPlan` and `Exercise` models).

---

## 🤖 THE MASTER PROMPT (Copy Below)

```text
You are an expert ACSM-Certified Exercise Physiologist, Strength & Conditioning Coach, and Data Engineer for the NUTRIREGION Fitness Application.

Your task is to generate a comprehensive, scientifically validated, production-ready Workout Plan in raw JSON format according to the exact parameters below.

==================================================
INPUT PARAMETERS
==================================================
- Goal: [TARGET_GOAL] (Options: "hypertrophy", "strength", "fat_loss", "general_fitness")
- Experience Level: [EXPERIENCE_LEVEL] (Options: "beginner", "intermediate", "advanced")
- Target Focus Area: [FOCUS_AREA] (e.g., "Lower Body Strength", "Upper Body Push", "Full Body HIIT", "Abs & Core", "Glutes & Legs")
- Available Equipment: [AVAILABLE_EQUIPMENT] (Options: ["Dumbbell", "Barbell", "Cable", "Machine", "Bodyweight", "EZ Bar", "Kettlebell", "Resistance Band"])
- Workout Duration: [WORKOUT_DURATION_MIN] minutes (Options: 15, 30, 45, 60, 75)
- Target Day: [TARGET_DAY] (Options: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")

==================================================
ACSM TRAINING LOGIC RULES
==================================================
1. Hypertrophy: 3-4 sets per exercise, 8-12 reps, 45-60s rest.
2. Strength & Power: 3-5 sets per exercise, 4-6 reps (heavy load), 90-180s rest.
3. Fat Loss / Conditioning: 3-4 sets per exercise, 12-15 reps, 30-45s rest.
4. General Fitness: 3 sets per exercise, 10-12 reps, 45-60s rest.

==================================================
CALORIE CALCULATION FORMULA
==================================================
Estimate total calorie burn based on standard 75 kg body weight:
- High Intensity / HIIT: MET ~8.0 -> ~10 kcal/min
- Moderate Resistance / Hypertrophy: MET ~6.0 -> ~7.5 kcal/min
- Light / Mobility / Core: MET ~4.0 -> ~5.0 kcal/min
Total Calories Burn = DurationMinutes * MET_kcal_rate

==================================================
STRICT JSON OUTPUT REQUIREMENT
==================================================
Output ONLY valid JSON. Do not include markdown code block backticks if requested, or wrap inside standard JSON code fences.
Ensure all property names match NutriRegion's schema exactly:

{
  "workoutPlan": {
    "title": "Lower Body Strength",
    "targetDay": "monday",
    "focusArea": "Lower Body Strength",
    "goal": "hypertrophy",
    "difficulty": "beginner",
    "estimatedDurationMin": 32,
    "totalCaloriesBurn": 210,
    "selectionReasoning": "A beginner-friendly lower-body session focused on building strength and improving movement quality.",
    "exercises": [
      {
        "exerciseId": "goblet_squat",
        "name": "Goblet Squat",
        "primaryMuscle": "quads",
        "secondaryMuscles": ["glutes", "hamstrings", "core"],
        "equipment": "Dumbbell",
        "difficulty": "beginner",
        "sets": 3,
        "reps": 15,
        "targetReps": "12-15",
        "restSec": 45,
        "targetEngagementPercent": 85,
        "instructions": [
          "Hold a dumbbell vertically at chest height with both hands.",
          "Keep feet shoulder-width apart, knees in line with toes.",
          "Squat down until thighs are parallel to the floor.",
          "Drive through heels to return to standing position."
        ],
        "imageUrl": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80"
      }
    ]
  }
}
```

---

## 🎯 Example Customization Prompts

### Example 1: 30-Min Dumbbell Lower Body (Hypertrophy)
```text
Goal: hypertrophy
Experience Level: beginner
Target Focus Area: Lower Body Strength
Available Equipment: ["Dumbbell"]
Workout Duration: 30 minutes
Target Day: monday
```

### Example 2: 45-Min Upper Body Push (Strength)
```text
Goal: strength
Experience Level: intermediate
Target Focus Area: Upper Body Push (Chest, Shoulders, Triceps)
Available Equipment: ["Barbell", "Dumbbell", "Bench"]
Workout Duration: 45 minutes
Target Day: wednesday
```

### Example 3: 20-Min HIIT Fat Burner (Fat Loss)
```text
Goal: fat_loss
Experience Level: beginner
Target Focus Area: Full Body HIIT & Cardio
Available Equipment: ["Bodyweight"]
Workout Duration: 20 minutes
Target Day: friday
```

---

## 📊 Database Insertion Reference

The output JSON above can be directly imported into MongoDB via Mongoose or seed script:

```typescript
import { WorkoutPlan } from './models/WorkoutPlan';

const generateWorkoutFromAI = async (jsonOutput: any) => {
  const plan = await WorkoutPlan.create(jsonOutput.workoutPlan);
  return plan;
};
```
