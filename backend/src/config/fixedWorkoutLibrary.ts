export interface IFixedExerciseDefinition {
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  movementPattern: string;
  instructions: string[];
  imageUrl?: string;
}

export const SINGLE_MUSCLE_EXERCISE_LIBRARIES: Record<string, IFixedExerciseDefinition[]> = {
  chest: [
    { name: 'Barbell Bench Press', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'front_delts'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'horizontal_push', instructions: ['Lie flat on bench.', 'Lower bar to mid-chest.', 'Drive up firmly.'] },
    { name: 'Incline Barbell Bench Press', primaryMuscle: 'chest', secondaryMuscles: ['front_delts', 'triceps'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'incline_push', instructions: ['Set bench to 30-45 degrees.', 'Lower barbell to upper chest.', 'Press overhead.'] },
    { name: 'Dumbbell Bench Press', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'front_delts'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'horizontal_push', instructions: ['Hold dumbbells at chest level.', 'Press up vertically.', 'Squeeze chest at top.'] },
    { name: 'Incline Dumbbell Press', primaryMuscle: 'chest', secondaryMuscles: ['front_delts', 'triceps'], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'incline_push', instructions: ['Set bench to 30 degrees.', 'Press dumbbells upward over upper chest.'] },
    { name: 'Machine Chest Press', primaryMuscle: 'chest', secondaryMuscles: ['triceps'], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'horizontal_push', instructions: ['Adjust seat so handles align with mid-chest.', 'Press forward with controlled effort.'] },
    { name: 'Cable Chest Fly', primaryMuscle: 'chest', secondaryMuscles: ['front_delts'], equipment: 'Cable', difficulty: 'intermediate', movementPattern: 'fly', instructions: ['Set pulleys at chest height.', 'Bring handles together in a hugging motion.'] },
    { name: 'Pec Deck Fly', primaryMuscle: 'chest', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'fly', instructions: ['Sit tall with back supported.', 'Bring machine pads together in front of chest.'] },
    { name: 'Dumbbell Fly', primaryMuscle: 'chest', secondaryMuscles: ['front_delts'], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'fly', instructions: ['Lie flat holding dumbbells overhead.', 'Lower arms outward with slight elbow bend.', 'Squeeze back together.'] },
    { name: 'Push-Up', primaryMuscle: 'chest', secondaryMuscles: ['triceps', 'core'], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'horizontal_push', instructions: ['Place hands slightly wider than shoulders.', 'Lower body until chest touches floor.', 'Push back up.'] },
  ],
  back: [
    { name: 'Lat Pulldown', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'Cable', difficulty: 'beginner', movementPattern: 'vertical_pull', instructions: ['Grip bar wide.', 'Pull bar down to upper chest.', 'Control back up.'] },
    { name: 'Pull-Up', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'core'], equipment: 'Bodyweight', difficulty: 'advanced', movementPattern: 'vertical_pull', instructions: ['Hang with overhand grip.', 'Pull chin above bar.', 'Lower slowly.'] },
    { name: 'Barbell Bent-Over Row', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'erector_spinae'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'horizontal_pull', instructions: ['Hinge at hips to 45 degrees.', 'Row barbell to belly button.', 'Squeeze shoulder blades.'] },
    { name: 'Seated Cable Row', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'Cable', difficulty: 'beginner', movementPattern: 'horizontal_pull', instructions: ['Sit with feet braced.', 'Pull handle toward abdomen.', 'Keep spine neutral.'] },
    { name: 'One-Arm Dumbbell Row', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'horizontal_pull', instructions: ['Place knee and hand on bench.', 'Row dumbbell to hip.', 'Lower under control.'] },
    { name: 'Chest-Supported Dumbbell Row', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'horizontal_pull', instructions: ['Lie face down on incline bench.', 'Row dumbbells upward.', 'Squeeze lats at top.'] },
    { name: 'T-Bar Row', primaryMuscle: 'back', secondaryMuscles: ['biceps', 'erector_spinae'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'horizontal_pull', instructions: ['Straddle landmine bar.', 'Row handles to chest.', 'Lower under control.'] },
    { name: 'Straight-Arm Pulldown', primaryMuscle: 'back', secondaryMuscles: ['triceps'], equipment: 'Cable', difficulty: 'intermediate', movementPattern: 'lat_isolation', instructions: ['Keep arms straight with slight elbow bend.', 'Pull cable down to thighs.'] },
    { name: 'Machine Row', primaryMuscle: 'back', secondaryMuscles: ['biceps'], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'horizontal_pull', instructions: ['Sit chest against pad.', 'Pull handles back firmly.', 'Return with control.'] },
  ],
  biceps: [
    { name: 'Barbell Curl', primaryMuscle: 'biceps', secondaryMuscles: ['forearms'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'elbow_flexion', instructions: ['Hold barbell underhand.', 'Curl bar up to shoulders.', 'Squeeze biceps.'] },
    { name: 'EZ-Bar Curl', primaryMuscle: 'biceps', secondaryMuscles: ['forearms'], equipment: 'EZ Bar', difficulty: 'beginner', movementPattern: 'elbow_flexion', instructions: ['Grip angled EZ-bar.', 'Curl weight up with elbows fixed at sides.'] },
    { name: 'Dumbbell Curl', primaryMuscle: 'biceps', secondaryMuscles: ['forearms'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'elbow_flexion', instructions: ['Hold dumbbells at sides.', 'Curl up while supinating wrists.'] },
    { name: 'Incline Dumbbell Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'elbow_flexion', instructions: ['Sit back on 45-degree bench.', 'Curl dumbbells up from deep stretch.'] },
    { name: 'Hammer Curl', primaryMuscle: 'biceps', secondaryMuscles: ['forearms'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'elbow_flexion', instructions: ['Hold dumbbells with palms facing each other.', 'Curl upward keeping neutral grip.'] },
    { name: 'Concentration Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'elbow_flexion', instructions: ['Rest elbow against inner thigh.', 'Curl dumbbell toward shoulder under tension.'] },
    { name: 'Preacher Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'EZ Bar', difficulty: 'intermediate', movementPattern: 'elbow_flexion', instructions: ['Rest upper arms on preacher pad.', 'Curl bar upward until full contraction.'] },
    { name: 'Cable Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', movementPattern: 'elbow_flexion', instructions: ['Attach straight bar to low pulley.', 'Curl bar upward with continuous cable tension.'] },
    { name: 'Spider Curl', primaryMuscle: 'biceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'elbow_flexion', instructions: ['Lie chest down on incline bench.', 'Curl dumbbells vertically.'] },
  ],
  triceps: [
    { name: 'Cable Triceps Pushdown', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', movementPattern: 'elbow_extension', instructions: ['Grip bar or rope at chest height.', 'Extend elbows down to full lockout.'] },
    { name: 'Rope Triceps Pushdown', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', movementPattern: 'elbow_extension', instructions: ['Grip rope handles.', 'Push down and spread rope apart at bottom lockout.'] },
    { name: 'Overhead Cable Extension', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'intermediate', movementPattern: 'elbow_extension', instructions: ['Face away from high pulley.', 'Extend rope overhead until arms straight.'] },
    { name: 'Dumbbell Overhead Extension', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'elbow_extension', instructions: ['Hold single dumbbell overhead with both hands.', 'Lower behind head then extend up.'] },
    { name: 'EZ-Bar Skull Crusher', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'EZ Bar', difficulty: 'intermediate', movementPattern: 'elbow_extension', instructions: ['Lie flat holding EZ-bar.', 'Bend elbows to lower bar toward forehead, then extend.'] },
    { name: 'Dumbbell Skull Crusher', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'elbow_extension', instructions: ['Lie flat holding dumbbells.', 'Lower dumbbells beside ears, then extend arms.'] },
    { name: 'Close-Grip Bench Press', primaryMuscle: 'triceps', secondaryMuscles: ['chest', 'front_delts'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'horizontal_push', instructions: ['Grip barbell shoulder-width apart.', 'Lower to chest and press up focusing on triceps.'] },
    { name: 'Machine Triceps Extension', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'elbow_extension', instructions: ['Sit with arms on pad.', 'Press handles down to full extension.'] },
    { name: 'Single-Arm Cable Extension', primaryMuscle: 'triceps', secondaryMuscles: [], equipment: 'Cable', difficulty: 'intermediate', movementPattern: 'elbow_extension', instructions: ['Grip cable wire with no handle.', 'Extend elbow downward across body.'] },
  ],
  shoulders: [
    { name: 'Dumbbell Shoulder Press', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'vertical_push', instructions: ['Sit tall holding dumbbells at ear level.', 'Press overhead to full extension.'] },
    { name: 'Barbell Overhead Press', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps', 'core'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'vertical_push', instructions: ['Stand holding barbell at clavicles.', 'Press bar overhead in straight line.'] },
    { name: 'Arnold Press', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'vertical_push', instructions: ['Start with palms facing you at chest.', 'Rotate palms out as you press overhead.'] },
    { name: 'Dumbbell Lateral Raise', primaryMuscle: 'shoulders', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'shoulder_abduction', instructions: ['Raise dumbbells laterally to shoulder height.', 'Lower under control.'] },
    { name: 'Cable Lateral Raise', primaryMuscle: 'shoulders', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', movementPattern: 'shoulder_abduction', instructions: ['Stand beside low pulley.', 'Raise cable outward to shoulder level.'] },
    { name: 'Machine Lateral Raise', primaryMuscle: 'shoulders', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'shoulder_abduction', instructions: ['Place arms against machine pads.', 'Raise arms laterally.'] },
    { name: 'Rear Delt Dumbbell Fly', primaryMuscle: 'shoulders', secondaryMuscles: ['upper_back'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'horizontal_abduction', instructions: ['Bend forward at hips.', 'Raise dumbbells outward focusing on rear delts.'] },
    { name: 'Reverse Pec Deck', primaryMuscle: 'shoulders', secondaryMuscles: ['upper_back'], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'horizontal_abduction', instructions: ['Face pec deck machine.', 'Fly handles backward squeezed rear delts.'] },
    { name: 'Face Pull', primaryMuscle: 'shoulders', secondaryMuscles: ['upper_back'], equipment: 'Cable', difficulty: 'beginner', movementPattern: 'horizontal_pull', instructions: ['Attach rope to upper cable.', 'Pull rope to eyes while spreading handles apart.'] },
  ],
  quads: [
    { name: 'Barbell Back Squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'core'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'squat', instructions: ['Rest bar across upper back.', 'Squat down until thighs parallel.', 'Drive back up.'] },
    { name: 'Front Squat', primaryMuscle: 'quads', secondaryMuscles: ['core', 'glutes'], equipment: 'Barbell', difficulty: 'advanced', movementPattern: 'squat', instructions: ['Hold bar in front rack across shoulders.', 'Squat deeply keeping torso upright.'] },
    { name: 'Goblet Squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes', 'core'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'squat', instructions: ['Hold dumbbell at chest.', 'Squat between knees keeping chest up.'] },
    { name: 'Leg Press', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'squat', instructions: ['Sit in leg press machine.', 'Lower sled to 90 degrees then press back up.'] },
    { name: 'Bulgarian Split Squat', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'lunge', instructions: ['Elevate rear foot on bench.', 'Lower front knee to 90 degrees then drive up.'] },
    { name: 'Walking Lunges', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'lunge', instructions: ['Step forward into lunge.', 'Alternate legs walking forward under control.'] },
    { name: 'Reverse Lunges', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'lunge', instructions: ['Step backward into lunge.', 'Return to starting position.'] },
    { name: 'Step-Ups', primaryMuscle: 'quads', secondaryMuscles: ['glutes'], equipment: 'Bench', difficulty: 'beginner', movementPattern: 'step_up', instructions: ['Step onto bench with full foot.', 'Drive through heel to stand tall.'] },
    { name: 'Leg Extension', primaryMuscle: 'quads', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'knee_extension', instructions: ['Sit in leg extension machine.', 'Extend legs to full lockout then lower slowly.'] },
  ],
  hamstrings: [
    { name: 'Romanian Deadlift', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'erector_spinae'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'hinge', instructions: ['Hold barbell at hips.', 'Hinge backward stretch hamstrings, then squeeze glutes up.'] },
    { name: 'Barbell Romanian Deadlift', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'hinge', instructions: ['Keep back flat.', 'Lower bar past knees with slight leg bend.'] },
    { name: 'Dumbbell Romanian Deadlift', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'hinge', instructions: ['Hold dumbbells in front of thighs.', 'Hinge hips backward then extend up.'] },
    { name: 'Stiff-Leg Deadlift', primaryMuscle: 'hamstrings', secondaryMuscles: ['erector_spinae'], equipment: 'Barbell', difficulty: 'advanced', movementPattern: 'hinge', instructions: ['Keep knees nearly locked.', 'Hinge forward lowering bar down shins.'] },
    { name: 'Lying Leg Curl', primaryMuscle: 'hamstrings', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'knee_flexion', instructions: ['Lie face down on leg curl machine.', 'Curl pad to glutes then lower slowly.'] },
    { name: 'Seated Leg Curl', primaryMuscle: 'hamstrings', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'knee_flexion', instructions: ['Sit in machine with thigh pad secured.', 'Flex knees downward under tension.'] },
    { name: 'Standing Leg Curl', primaryMuscle: 'hamstrings', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'knee_flexion', instructions: ['Stand facing machine.', 'Curl single leg upward to glute.'] },
    { name: 'Nordic Hamstring Curl', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes'], equipment: 'Bodyweight', difficulty: 'advanced', movementPattern: 'knee_flexion', instructions: ['Anchor ankles.', 'Lower torso forward under eccentric hamstring tension.'] },
    { name: 'Single-Leg Romanian Deadlift', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'core'], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'hinge', instructions: ['Balance on single leg.', 'Hinge forward lowering dumbbell to shin level.'] },
  ],
  glutes: [
    { name: 'Barbell Hip Thrust', primaryMuscle: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'Barbell', difficulty: 'intermediate', movementPattern: 'hip_extension', instructions: ['Rest upper back against bench with barbell over hips.', 'Drive hips up to full lockout.'] },
    { name: 'Dumbbell Hip Thrust', primaryMuscle: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'hip_extension', instructions: ['Rest back against bench holding dumbbell across hips.', 'Thrust upward to full glute squeeze.'] },
    { name: 'Glute Bridge', primaryMuscle: 'glutes', secondaryMuscles: ['hamstrings'], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'hip_extension', instructions: ['Lie on floor with knees bent.', 'Raise hips off floor squeezing glutes at top.'] },
    { name: 'Bulgarian Split Squat', primaryMuscle: 'glutes', secondaryMuscles: ['quads'], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'lunge', instructions: ['Elevate rear foot.', 'Sit back into hip to target glutes deeply.'] },
    { name: 'Reverse Lunge', primaryMuscle: 'glutes', secondaryMuscles: ['quads'], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'lunge', instructions: ['Step backward.', 'Lower back knee toward floor then drive up through front heel.'] },
    { name: 'Walking Lunge', primaryMuscle: 'glutes', secondaryMuscles: ['quads'], equipment: 'Dumbbell', difficulty: 'intermediate', movementPattern: 'lunge', instructions: ['Step forward walking continuously.', 'Keep front knee aligned over ankle.'] },
    { name: 'Step-Up', primaryMuscle: 'glutes', secondaryMuscles: ['quads'], equipment: 'Bench', difficulty: 'beginner', movementPattern: 'step_up', instructions: ['Step onto box.', 'Drive up through heel extending hip completely.'] },
    { name: 'Cable Glute Kickback', primaryMuscle: 'glutes', secondaryMuscles: [], equipment: 'Cable', difficulty: 'beginner', movementPattern: 'hip_extension', instructions: ['Attach ankle strap to low cable.', 'Kick leg backward squeezing glutes at top.'] },
    { name: 'Hip Abduction', primaryMuscle: 'glutes', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'abduction', instructions: ['Sit in hip abduction machine.', 'Push thighs outward under control.'] },
  ],
  calves: [
    { name: 'Standing Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'calf_raise', instructions: ['Place shoulders under pads.', 'Press up onto toes then stretch down below step level.'] },
    { name: 'Seated Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'calf_raise', instructions: ['Rest pad across lower thighs.', 'Raise heels up high then lower for deep stretch.'] },
    { name: 'Leg Press Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'calf_raise', instructions: ['Place toes on bottom of leg press footplate.', 'Flex ankles forward into calf extension.'] },
    { name: 'Single-Leg Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'calf_raise', instructions: ['Balance on single leg on step.', 'Raise heel up as high as possible.'] },
    { name: 'Dumbbell Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'calf_raise', instructions: ['Hold dumbbell at side.', 'Perform calf raises on step edge.'] },
    { name: 'Machine Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Machine', difficulty: 'beginner', movementPattern: 'calf_raise', instructions: ['Stand in machine.', 'Drive up onto ball of feet under control.'] },
    { name: 'Donkey Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Machine', difficulty: 'intermediate', movementPattern: 'calf_raise', instructions: ['Hinge forward at hips in machine.', 'Perform calf raises with hips flexed.'] },
    { name: 'Bodyweight Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'calf_raise', instructions: ['Stand tall on flat floor.', 'Raise up onto toes for high reps.'] },
    { name: 'Single-Leg Seated Calf Raise', primaryMuscle: 'calves', secondaryMuscles: [], equipment: 'Dumbbell', difficulty: 'beginner', movementPattern: 'calf_raise', instructions: ['Sit on bench holding dumbbell on knee.', 'Perform unilateral calf raise.'] },
  ],
  abs_core: [
    { name: 'Plank', primaryMuscle: 'abs_core', secondaryMuscles: ['shoulders'], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'anti_extension', instructions: ['Hold forearm plank with straight body.', 'Squeeze core and glutes tightly.'] },
    { name: 'Side Plank', primaryMuscle: 'abs_core', secondaryMuscles: ['obliques'], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'anti_lateral_flexion', instructions: ['Support body on single forearm on side.', 'Keep hips elevated off floor.'] },
    { name: 'Cable Crunch', primaryMuscle: 'abs_core', secondaryMuscles: [], equipment: 'Cable', difficulty: 'intermediate', movementPattern: 'trunk_flexion', instructions: ['Kneel holding rope at head height.', 'Flex spine downward pulling elbows to knees.'] },
    { name: 'Reverse Crunch', primaryMuscle: 'abs_core', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'trunk_flexion', instructions: ['Lie flat on back.', 'Curl knees to chest raising hips off floor.'] },
    { name: 'Hanging Knee Raise', primaryMuscle: 'abs_core', secondaryMuscles: ['hip_flexors'], equipment: 'Pull-Up Bar', difficulty: 'intermediate', movementPattern: 'trunk_flexion', instructions: ['Hang from bar.', 'Raise knees to chest level without swinging.'] },
    { name: 'Hanging Leg Raise', primaryMuscle: 'abs_core', secondaryMuscles: ['hip_flexors'], equipment: 'Pull-Up Bar', difficulty: 'advanced', movementPattern: 'trunk_flexion', instructions: ['Hang from bar.', 'Raise straight legs parallel to floor.'] },
    { name: 'Dead Bug', primaryMuscle: 'abs_core', secondaryMuscles: [], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'anti_extension', instructions: ['Lie back with arms and knees up.', 'Extend opposite arm and leg while keeping back flat.'] },
    { name: 'Bicycle Crunch', primaryMuscle: 'abs_core', secondaryMuscles: ['obliques'], equipment: 'Bodyweight', difficulty: 'beginner', movementPattern: 'rotation', instructions: ['Lie on back.', 'Touch opposite elbow to knee in pedaling motion.'] },
    { name: 'Pallof Press', primaryMuscle: 'abs_core', secondaryMuscles: [], equipment: 'Cable', difficulty: 'intermediate', movementPattern: 'anti_rotation', instructions: ['Stand perpendicular to cable.', 'Press handle straight out resisting rotation.'] },
  ],
};

export const REQUIRED_DOUBLE_SPLITS = {
  chest_triceps: {
    chest: [
      'Barbell Bench Press',
      'Incline Dumbbell Press',
      'Machine Chest Press',
      'Cable Chest Fly',
      'Pec Deck Fly',
    ],
    triceps: [
      'Cable Triceps Pushdown',
      'Overhead Cable Extension',
      'EZ-Bar Skull Crusher',
      'Dumbbell Overhead Extension',
    ],
  },
  back_biceps: {
    back: [
      'Lat Pulldown',
      'Barbell Bent-Over Row',
      'Seated Cable Row',
      'One-Arm Dumbbell Row',
      'Chest-Supported Dumbbell Row',
    ],
    biceps: [
      'Barbell Curl',
      'Incline Dumbbell Curl',
      'Hammer Curl',
      'Preacher Curl',
    ],
  },
  legs_shoulders: {
    legs: [
      'Barbell Back Squat',
      'Romanian Deadlift',
      'Leg Press',
      'Bulgarian Split Squat',
      'Leg Extension',
    ],
    shoulders: [
      'Dumbbell Shoulder Press',
      'Dumbbell Lateral Raise',
      'Rear Delt Dumbbell Fly',
      'Face Pull',
    ],
  },
};

export const PREDEFINED_SPLITS = [
  {
    id: 'chest_triceps',
    name: 'Chest + Triceps',
    muscles: [
      { muscle: 'chest', exerciseCount: 5 },
      { muscle: 'triceps', exerciseCount: 4 },
    ],
    totalExercises: 9,
  },
  {
    id: 'back_biceps',
    name: 'Back + Biceps',
    muscles: [
      { muscle: 'back', exerciseCount: 5 },
      { muscle: 'biceps', exerciseCount: 4 },
    ],
    totalExercises: 9,
  },
  {
    id: 'legs_shoulders',
    name: 'Legs + Shoulders',
    muscles: [
      { muscle: 'legs', exerciseCount: 5 },
      { muscle: 'shoulders', exerciseCount: 4 },
    ],
    totalExercises: 9,
  },
];
