# Workout Intelligence Engine for NUTRIREGION

This document serves as the authoritative specification and architecture guide for the **NutriRegion Workout Intelligence Engine**.

---

## System Overview

The Workout Intelligence Engine is responsible for creating and maintaining a comprehensive, structured, production-ready exercise and workout library for the NutriRegion fitness application.

The system supports:
- Personalized workouts
- Workout library browsing
- Workout categories
- Goal-based workouts
- Body-area workouts
- Equipment-based workouts
- Home workouts
- Gym workouts
- Beginner / intermediate / advanced options
- Short and long workouts
- Exercise replacement
- Exercise-by-exercise tracking
- Set / rep tracking
- Workout history
- Weekly routines
- AI-generated workouts
- Activity tracking
- Progression over time

> **IMPORTANT**:
> Evidence-informed training principles adapt training variables according to goal, experience, exercise type, equipment, training age, workout duration, target muscles, fatigue, previous performance, weekly training volume, and user constraints. The 2026 ACSM resistance-training position stand is used as a primary reference for healthy adults.

---

## 1. Workout Taxonomy

### A. Resistance Training
1. Full Body, 2. Upper Body, 3. Lower Body, 4. Push, 5. Pull, 6. Legs, 7. Chest, 8. Back, 9. Shoulders, 10. Arms, 11. Biceps, 12. Triceps, 13. Forearms, 14. Glutes, 15. Quads, 16. Hamstrings, 17. Calves, 18. Abs, 19. Core, 20. Posterior Chain.

### B. Goal-Based Training
1. Muscle Hypertrophy, 2. Strength, 3. Power, 4. General Fitness, 5. Muscular Endurance, 6. Conditioning, 7. Fat-Loss Support, 8. Athletic Performance, 9. Functional Fitness, 10. Mobility / Movement Quality.

### C. Home Workouts
1. No Equipment, 2. Bodyweight, 3. Dumbbell Home Workout, 4. Resistance Band, 5. Kettlebell Home Workout, 6. Jump Rope, 7. Chair/Bench-Assisted, 8. Small-Space Workout, 9. Apartment-Friendly Low-Impact, 10. Beginner Home Workout.

### D. Gym Workouts
1. Machine Workout, 2. Free Weight Workout, 3. Barbell Workout, 4. Dumbbell Workout, 5. Cable Workout, 6. Smith Machine Workout, 7. EZ Bar Workout, 8. Mixed Equipment, 9. Commercial Gym, 10. Minimal Gym Equipment.

### E. Cardio
1. Walking, 2. Brisk Walking, 3. Jogging, 4. Running, 5. Cycling, 6. Stationary Bike, 7. Swimming, 8. Rowing, 9. Elliptical, 10. Stair Climber, 11. Jump Rope, 12. Low-Impact Cardio, 13. Steady-State Cardio, 14. Intervals, 15. Circuit Conditioning.

### F. HIIT / Interval Training
1. Full Body HIIT, 2. Cardio HIIT, 3. Bodyweight HIIT, 4. Dumbbell HIIT, 5. Kettlebell Intervals, 6. Sprint Intervals, 7. Bike Intervals, 8. Rowing Intervals, 9. Low-Impact Intervals, 10. Beginner Intervals.

### G. Core Training
1. Abs, 2. Core Stability, 3. Anti-Extension, 4. Anti-Rotation, 5. Anti-Lateral Flexion, 6. Trunk Flexion, 7. Posterior Core, 8. Beginner Core, 9. Advanced Core, 10. Core Conditioning.

### H. Mobility / Flexibility
1. Full Body Mobility, 2. Upper Body Mobility, 3. Lower Body Mobility, 4. Hip Mobility, 5. Shoulder Mobility, 6. Thoracic Mobility, 7. Ankle Mobility, 8. Dynamic Warm-Up, 9. Cool-Down, 10. Recovery Session, 11. Stretching, 12. Movement Preparation.

### I. Athletic / Performance
1. General Athletic Conditioning, 2. Speed Development, 3. Agility, 4. Coordination, 5. Jumping / Plyometric Training, 6. Acceleration, 7. Deceleration, 8. Change of Direction, 9. Power Development, 10. Sport Preparation.

### J. Special Format Workouts
1. 10-Minute Quick Workout, 2. 15-Minute Workout, 3. 20-Minute Workout, 4. 30-Minute Workout, 5. 45-Minute Workout, 6. 60-Minute Workout, 7. 75-Minute Workout, 8. Express Workout, 9. Lunch Break Workout, 10. Weekend Workout, 11. Circuit Workout, 12. Superset Workout, 13. Tri-set Workout, 14. EMOM-style workout, 15. AMRAP-style workout.

---

## 2. Experience Levels
- **Beginner**: Technique focus, manageable volume, simple movement patterns, stable exercises, gradual progression.
- **Intermediate**: Exercise variety, higher volume, supersets, more demanding patterns.
- **Advanced**: High specificity, complex combinations, advanced programming structures.

---

## 3. Body Area & Movement Pattern Taxonomy

### Primary Muscles
`chest`, `upper_chest`, `mid_chest`, `lower_chest`, `lats`, `upper_back`, `mid_back`, `traps`, `rear_delts`, `front_delts`, `side_delts`, `biceps`, `triceps`, `forearms`, `core`, `abs`, `obliques`, `erector_spinae`, `glutes`, `quads`, `hamstrings`, `adductors`, `abductors`, `calves`, `tibialis_anterior`.

### Movement Patterns
`horizontal_push`, `vertical_push`, `horizontal_pull`, `vertical_pull`, `squat`, `hinge`, `lunge`, `step_up`, `carry`, `rotation`, `anti_rotation`, `anti_extension`, `anti_lateral_flexion`, `calf_raise`, `elbow_flexion`, `elbow_extension`, `shoulder_abduction`, `shoulder_external_rotation`, `shoulder_internal_rotation`, `locomotion`, `conditioning`.

---

## 4. Equipment Database
`Bodyweight`, `Dumbbell`, `Barbell`, `Cable`, `Machine`, `EZ Bar`, `Kettlebell`, `Resistance Band`, `Bench`, `Smith Machine`, `Pull-Up Bar`, `Dip Station`, `Medicine Ball`, `Stability Ball`, `Cardio Machine`, `Rowing Machine`, `Treadmill`, `Stationary Bike`, `Elliptical`, `Stair Climber`, `Jump Rope`.

> **Equipment Safety Rule**: If user selects `Bodyweight` only, never generate barbell, dumbbell, machine, cable, or kettlebell exercises.

---

## 5. Workout Duration & Structure
- **15 Mins**: 2–3 min warm-up, 8–10 min main (2–4 movements), 1–2 min cool-down.
- **30 Mins**: 4–5 min warm-up, 20–23 min main (4–6 movements), 2–3 min cool-down.
- **45 Mins**: 5–7 min warm-up, 32–35 min main (5–8 movements), 3–5 min cool-down.
- **60 Mins**: 7–10 min warm-up, 43–48 min main (6–10 movements), 5 min cool-down.
- **75 Mins**: 8–10 min warm-up, 55–60 min main (7–12 movements), 5–7 min cool-down.

---

## 6. Output Standard Schema

```json
{
  "workoutPlan": {
    "workoutId": "unique_id",
    "title": "Lower Body Strength",
    "targetDay": "monday",
    "focusArea": "Lower Body Strength",
    "goal": "hypertrophy",
    "difficulty": "beginner",
    "equipment": ["Dumbbell"],
    "estimatedDurationMin": 32,
    "totalCaloriesBurn": 210,
    "calorieEstimateType": "estimated",
    "selectionReasoning": "A beginner-friendly lower-body session focused on building strength and improving movement quality.",
    "warmup": ["Dynamic Hip Swings", "Bodyweight Squat"],
    "exercises": [
      {
        "exerciseId": "goblet_squat",
        "name": "Goblet Squat",
        "primaryMuscle": "quads",
        "secondaryMuscles": ["glutes", "core"],
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
    ],
    "cooldown": ["Static Quad Stretch", "Child's Pose"],
    "tags": ["lower_body", "hypertrophy", "dumbbell", "beginner"]
  }
}
```
