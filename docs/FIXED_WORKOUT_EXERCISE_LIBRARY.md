# NUTRIREGION — FIXED WORKOUT EXERCISE LIBRARY SPECIFICATION

This document outlines the fixed exercise library rules, predefined split configurations, and equipment replacement constraints for the **NutriRegion Fitness Application**.

---

## 📌 Core Rules

### Rule 1 — Single Muscle Selection
When the user selects **ONLY ONE MUSCLE**, the system MUST return **EXACTLY 9 exercise options** for that muscle:
- **Chest**: Barbell Bench Press, Incline Barbell Bench Press, Dumbbell Bench Press, Incline Dumbbell Press, Machine Chest Press, Cable Chest Fly, Pec Deck Fly, Dumbbell Fly, Push-Up.
- **Back**: Lat Pulldown, Pull-Up, Barbell Bent-Over Row, Seated Cable Row, One-Arm Dumbbell Row, Chest-Supported Dumbbell Row, T-Bar Row, Straight-Arm Pulldown, Machine Row.
- **Biceps**: Barbell Curl, EZ-Bar Curl, Dumbbell Curl, Incline Dumbbell Curl, Hammer Curl, Concentration Curl, Preacher Curl, Cable Curl, Spider Curl.
- **Triceps**: Cable Triceps Pushdown, Rope Triceps Pushdown, Overhead Cable Extension, Dumbbell Overhead Extension, EZ-Bar Skull Crusher, Dumbbell Skull Crusher, Close-Grip Bench Press, Machine Triceps Extension, Single-Arm Cable Extension.
- **Shoulders**: Dumbbell Shoulder Press, Barbell Overhead Press, Arnold Press, Dumbbell Lateral Raise, Cable Lateral Raise, Machine Lateral Raise, Rear Delt Dumbbell Fly, Reverse Pec Deck, Face Pull.
- **Quads**: Barbell Back Squat, Front Squat, Goblet Squat, Leg Press, Bulgarian Split Squat, Walking Lunges, Reverse Lunges, Step-Ups, Leg Extension.
- **Hamstrings**: Romanian Deadlift, Barbell Romanian Deadlift, Dumbbell Romanian Deadlift, Stiff-Leg Deadlift, Lying Leg Curl, Seated Leg Curl, Standing Leg Curl, Nordic Hamstring Curl, Single-Leg Romanian Deadlift.
- **Glutes**: Barbell Hip Thrust, Dumbbell Hip Thrust, Glute Bridge, Bulgarian Split Squat, Reverse Lunge, Walking Lunge, Step-Up, Cable Glute Kickback, Hip Abduction.
- **Calves**: Standing Calf Raise, Seated Calf Raise, Leg Press Calf Raise, Single-Leg Calf Raise, Dumbbell Calf Raise, Machine Calf Raise, Donkey Calf Raise, Bodyweight Calf Raise, Single-Leg Seated Calf Raise.
- **Abs / Core**: Plank, Side Plank, Cable Crunch, Reverse Crunch, Hanging Knee Raise, Hanging Leg Raise, Dead Bug, Bicycle Crunch, Pallof Press.

---

### Rule 2 & 3 — Double Muscle Selection (5 + 4 = 9 TOTAL)
When the user selects **TWO MUSCLES**, the system MUST return **EXACTLY 9 exercises TOTAL**:
- **First Muscle**: 5 Exercises
- **Second Muscle**: 4 Exercises

Predefined Double Muscle Libraries:
1. **Chest + Triceps** (Chest = 5, Triceps = 4, Total = 9)
   - *Chest*: Barbell Bench Press, Incline Dumbbell Press, Machine Chest Press, Cable Chest Fly, Pec Deck Fly.
   - *Triceps*: Cable Triceps Pushdown, Overhead Cable Extension, EZ-Bar Skull Crusher, Dumbbell Overhead Extension.
2. **Back + Biceps** (Back = 5, Biceps = 4, Total = 9)
   - *Back*: Lat Pulldown, Barbell Bent-Over Row, Seated Cable Row, One-Arm Dumbbell Row, Chest-Supported Dumbbell Row.
   - *Biceps*: Barbell Curl, Incline Dumbbell Curl, Hammer Curl, Preacher Curl.
3. **Legs + Shoulders** (Legs = 5, Shoulders = 4, Total = 9)
   - *Legs*: Barbell Back Squat, Romanian Deadlift, Leg Press, Bulgarian Split Squat, Leg Extension.
   - *Shoulders*: Dumbbell Shoulder Press, Dumbbell Lateral Raise, Rear Delt Dumbbell Fly, Face Pull.

---

## ⚙️ Predefined Split Configuration JSON

```json
{
  "splits": [
    {
      "id": "chest_triceps",
      "name": "Chest + Triceps",
      "muscles": [
        { "muscle": "chest", "exerciseCount": 5 },
        { "muscle": "triceps", "exerciseCount": 4 }
      ],
      "totalExercises": 9
    },
    {
      "id": "back_biceps",
      "name": "Back + Biceps",
      "muscles": [
        { "muscle": "back", "exerciseCount": 5 },
        { "muscle": "biceps", "exerciseCount": 4 }
      ],
      "totalExercises": 9
    },
    {
      "id": "legs_shoulders",
      "name": "Legs + Shoulders",
      "muscles": [
        { "muscle": "legs", "exerciseCount": 5 },
        { "muscle": "shoulders", "exerciseCount": 4 }
      ],
      "totalExercises": 9
    }
  ]
}
```
