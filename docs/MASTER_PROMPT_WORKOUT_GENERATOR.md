# MASTER PROMPT — NUTRIREGION WORKOUT GENERATOR

This document contains the official Master Prompt for the **NutriRegion Workout Generator Engine**.

---

## Absolute Exercise Count & Priority Rule

Every generated workout plan MUST contain **AT LEAST 8–9 selectable exercises** (minimum 8, default 9, maximum 12).

- **Recommended / Primary Exercises**: Marked as `"priority": "primary"` (first 3–6 exercises recommended based on workout duration).
- **Optional Exercises**: Marked as `"priority": "optional"` (remaining exercises to complete the 8–12 exercise choice library).

The user can choose which exercises they actually perform based on time, equipment, energy level, and preference.

---

## Standard JSON Response Format

```json
{
  "workoutPlan": {
    "title": "CHEST + TRICEPS ROUTINE",
    "targetDay": "monday",
    "focusArea": "CHEST + TRICEPS",
    "goal": "hypertrophy",
    "difficulty": "intermediate",
    "estimatedDurationMin": 45,
    "totalCaloriesBurn": 280,
    "selectionReasoning": "Generated 9 selectable exercise options for CHEST + TRICEPS (5 primary recommended for 45-min HYPERTROPHY session).",
    "exerciseSelection": {
      "minimumRequired": 8,
      "recommendedCount": 5,
      "totalOptionsGenerated": 9,
      "userCanChoose": true
    },
    "recoveryContext": {
      "previousMusclesTrained": ["LEGS"],
      "recoveryConsideration": "Prior session recovery factored. Focus area CHEST + TRICEPS is fully rested.",
      "nextWorkoutSuggestion": "Recommend Back & Biceps tomorrow for optimal muscular recovery."
    },
    "exercises": [
      {
        "exerciseId": "ex_1",
        "name": "Barbell Bench Press",
        "priority": "primary",
        "primaryMuscle": "chest",
        "secondaryMuscles": ["triceps", "front_delts"],
        "equipment": "Barbell",
        "difficulty": "intermediate",
        "sets": 3,
        "reps": 10,
        "targetReps": "8-12",
        "restSec": 60,
        "targetEngagementPercent": 85,
        "instructions": ["Lower bar under control.", "Press vertically."],
        "imageUrl": "https://images.unsplash.com/photo-1574680096145-d05b474e2155"
      },
      {
        "exerciseId": "ex_6",
        "name": "Cable Triceps Pushdown",
        "priority": "primary",
        "primaryMuscle": "triceps",
        "secondaryMuscles": [],
        "equipment": "Cable",
        "difficulty": "beginner",
        "sets": 3,
        "reps": 12,
        "targetReps": "8-12",
        "restSec": 60,
        "targetEngagementPercent": 80,
        "instructions": ["Extend elbows fully downward."],
        "imageUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e"
      },
      {
        "exerciseId": "ex_8",
        "name": "Pec Deck Fly",
        "priority": "optional",
        "primaryMuscle": "chest",
        "secondaryMuscles": [],
        "equipment": "Machine",
        "difficulty": "beginner",
        "sets": 3,
        "reps": 12,
        "targetReps": "8-12",
        "restSec": 60,
        "targetEngagementPercent": 75,
        "instructions": ["Bring handles together smoothly."],
        "imageUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e"
      }
    ]
  }
}
```
