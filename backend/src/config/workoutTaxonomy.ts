export const WORKOUT_TAXONOMY = {
  RESISTANCE_TRAINING: [
    'Full Body', 'Upper Body', 'Lower Body', 'Push', 'Pull', 'Legs', 'Chest', 'Back',
    'Shoulders', 'Arms', 'Biceps', 'Triceps', 'Forearms', 'Glutes', 'Quads', 'Hamstrings',
    'Calves', 'Abs', 'Core', 'Posterior Chain'
  ],
  GOAL_BASED: [
    'Muscle Hypertrophy', 'Strength', 'Power', 'General Fitness', 'Muscular Endurance',
    'Conditioning', 'Fat-Loss Support', 'Athletic Performance', 'Functional Fitness', 'Mobility / Movement Quality'
  ],
  HOME_WORKOUTS: [
    'No Equipment', 'Bodyweight', 'Dumbbell Home Workout', 'Resistance Band', 'Kettlebell Home Workout',
    'Jump Rope', 'Chair/Bench-Assisted', 'Small-Space Workout', 'Apartment-Friendly Low-Impact', 'Beginner Home Workout'
  ],
  GYM_WORKOUTS: [
    'Machine Workout', 'Free Weight Workout', 'Barbell Workout', 'Dumbbell Workout', 'Cable Workout',
    'Smith Machine Workout', 'EZ Bar Workout', 'Mixed Equipment', 'Commercial Gym', 'Minimal Gym Equipment'
  ],
  CARDIO: [
    'Walking', 'Brisk Walking', 'Jogging', 'Running', 'Cycling', 'Stationary Bike', 'Swimming',
    'Rowing', 'Elliptical', 'Stair Climber', 'Jump Rope', 'Low-Impact Cardio', 'Steady-State Cardio', 'Intervals', 'Circuit Conditioning'
  ],
  HIIT: [
    'Full Body HIIT', 'Cardio HIIT', 'Bodyweight HIIT', 'Dumbbell HIIT', 'Kettlebell Intervals',
    'Sprint Intervals', 'Bike Intervals', 'Rowing Intervals', 'Low-Impact Intervals', 'Beginner Intervals'
  ],
  CORE: [
    'Abs', 'Core Stability', 'Anti-Extension', 'Anti-Rotation', 'Anti-Lateral Flexion',
    'Trunk Flexion', 'Posterior Core', 'Beginner Core', 'Advanced Core', 'Core Conditioning'
  ],
  MOBILITY: [
    'Full Body Mobility', 'Upper Body Mobility', 'Lower Body Mobility', 'Hip Mobility', 'Shoulder Mobility',
    'Thoracic Mobility', 'Ankle Mobility', 'Dynamic Warm-Up', 'Cool-Down', 'Recovery Session', 'Stretching', 'Movement Preparation'
  ],
  ATHLETIC: [
    'General Athletic Conditioning', 'Speed Development', 'Agility', 'Coordination', 'Jumping / Plyometric Training',
    'Acceleration', 'Deceleration', 'Change of Direction', 'Power Development', 'Sport Preparation'
  ],
  FORMATS: [
    '10-Minute Quick Workout', '15-Minute Workout', '20-Minute Workout', '30-Minute Workout',
    '45-Minute Workout', '60-Minute Workout', '75-Minute Workout', 'Express Workout',
    'Lunch Break Workout', 'Weekend Workout', 'Circuit Workout', 'Superset Workout',
    'Tri-set Workout', 'EMOM-style workout', 'AMRAP-style workout'
  ]
};

export const PRIMARY_MUSCLES = [
  'chest', 'upper_chest', 'mid_chest', 'lower_chest', 'lats', 'upper_back', 'mid_back',
  'traps', 'rear_delts', 'front_delts', 'side_delts', 'biceps', 'triceps', 'forearms',
  'core', 'abs', 'obliques', 'erector_spinae', 'glutes', 'quads', 'hamstrings',
  'adductors', 'abductors', 'calves', 'tibialis_anterior'
];

export const MOVEMENT_PATTERNS = [
  'horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'squat',
  'hinge', 'lunge', 'step_up', 'carry', 'rotation', 'anti_rotation', 'anti_extension',
  'anti_lateral_flexion', 'calf_raise', 'elbow_flexion', 'elbow_extension',
  'shoulder_abduction', 'shoulder_external_rotation', 'shoulder_internal_rotation',
  'locomotion', 'conditioning'
];

export const SUPPORTED_EQUIPMENT = [
  'Bodyweight', 'Dumbbell', 'Barbell', 'Cable', 'Machine', 'EZ Bar', 'Kettlebell',
  'Resistance Band', 'Bench', 'Smith Machine', 'Pull-Up Bar', 'Dip Station',
  'Medicine Ball', 'Stability Ball', 'Cardio Machine', 'Rowing Machine',
  'Treadmill', 'Stationary Bike', 'Elliptical', 'Stair Climber', 'Jump Rope'
];

/**
 * Filter exercises strictly by selected user equipment
 */
export function isExerciseEquipmentAllowed(exerciseEquipment: string, userEquipmentList: string[]): boolean {
  const exEq = (exerciseEquipment || 'bodyweight').toLowerCase();
  if (exEq === 'bodyweight') return true;

  const allowedLower = userEquipmentList.map((e) => e.toLowerCase());

  // If user selected bodyweight only, prohibit equipment-requiring exercises
  if (allowedLower.length === 1 && allowedLower[0] === 'bodyweight') {
    return exEq === 'bodyweight';
  }

  return allowedLower.some((reqEq) => exEq.includes(reqEq) || reqEq.includes(exEq));
}
