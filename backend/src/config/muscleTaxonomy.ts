export interface IMuscleDefinition {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'shoulders' | 'triceps' | 'biceps' | 'forearms' | 'legs' | 'core';
  parentGroup: string;
  aliases: string[];
}

export const MUSCLE_TAXONOMY: Record<string, IMuscleDefinition> = {
  // SHOULDERS
  MUSCLE_ANTERIOR_DELTOID: {
    id: 'MUSCLE_ANTERIOR_DELTOID',
    name: 'Anterior Deltoid (Front Delt)',
    category: 'shoulders',
    parentGroup: 'shoulders',
    aliases: ['anterior deltoid', 'front delt', 'front deltoid', 'front shoulder', 'shoulders'],
  },
  MUSCLE_LATERAL_DELTOID: {
    id: 'MUSCLE_LATERAL_DELTOID',
    name: 'Lateral Deltoid (Side Delt)',
    category: 'shoulders',
    parentGroup: 'shoulders',
    aliases: ['lateral deltoid', 'side delt', 'medial deltoid', 'side shoulder', 'shoulders', 'delts'],
  },
  MUSCLE_POSTERIOR_DELTOID: {
    id: 'MUSCLE_POSTERIOR_DELTOID',
    name: 'Posterior Deltoid (Rear Delt)',
    category: 'shoulders',
    parentGroup: 'shoulders',
    aliases: ['posterior deltoid', 'rear delt', 'rear deltoid', 'rear shoulder', 'shoulders'],
  },

  // TRICEPS
  MUSCLE_TRICEPS_LONG: {
    id: 'MUSCLE_TRICEPS_LONG',
    name: 'Triceps Long Head',
    category: 'triceps',
    parentGroup: 'triceps',
    aliases: ['triceps long head', 'long head triceps', 'triceps', 'tricep'],
  },
  MUSCLE_TRICEPS_LATERAL: {
    id: 'MUSCLE_TRICEPS_LATERAL',
    name: 'Triceps Lateral Head',
    category: 'triceps',
    parentGroup: 'triceps',
    aliases: ['triceps lateral head', 'lateral head triceps', 'triceps', 'tricep'],
  },
  MUSCLE_TRICEPS_MEDIAL: {
    id: 'MUSCLE_TRICEPS_MEDIAL',
    name: 'Triceps Medial Head',
    category: 'triceps',
    parentGroup: 'triceps',
    aliases: ['triceps medial head', 'medial head triceps', 'triceps', 'tricep'],
  },

  // CHEST
  MUSCLE_CHEST: {
    id: 'MUSCLE_CHEST',
    name: 'Pectoralis Major (General Chest)',
    category: 'chest',
    parentGroup: 'chest',
    aliases: ['chest', 'pectorals', 'pecs', 'pectoralis major', 'mid chest'],
  },
  MUSCLE_UPPER_CHEST: {
    id: 'MUSCLE_UPPER_CHEST',
    name: 'Pectoralis Major (Upper Chest)',
    category: 'chest',
    parentGroup: 'chest',
    aliases: ['upper chest', 'clavicular head', 'upper pecs', 'chest'],
  },

  // BACK
  MUSCLE_LATS: {
    id: 'MUSCLE_LATS',
    name: 'Latissimus Dorsi (Lats)',
    category: 'back',
    parentGroup: 'back',
    aliases: ['lats', 'latissimus dorsi', 'back', 'lat'],
  },
  MUSCLE_UPPER_BACK: {
    id: 'MUSCLE_UPPER_BACK',
    name: 'Upper Back / Mid Back',
    category: 'back',
    parentGroup: 'back',
    aliases: ['upper back', 'mid back', 'back'],
  },
  MUSCLE_RHOMBOIDS: {
    id: 'MUSCLE_RHOMBOIDS',
    name: 'Rhomboids',
    category: 'back',
    parentGroup: 'back',
    aliases: ['rhomboids', 'rhomboid', 'back'],
  },
  MUSCLE_TRAPS: {
    id: 'MUSCLE_TRAPS',
    name: 'Trapezius (Traps)',
    category: 'back',
    parentGroup: 'back',
    aliases: ['traps', 'trapezius', 'upper traps', 'back'],
  },

  // BICEPS & FOREARMS
  MUSCLE_BICEPS: {
    id: 'MUSCLE_BICEPS',
    name: 'Biceps Brachii',
    category: 'biceps',
    parentGroup: 'biceps',
    aliases: ['biceps', 'bicep', 'biceps brachii', 'arms'],
  },
  MUSCLE_BRACHIALIS: {
    id: 'MUSCLE_BRACHIALIS',
    name: 'Brachialis',
    category: 'biceps',
    parentGroup: 'biceps',
    aliases: ['brachialis', 'biceps', 'outer arm'],
  },
  MUSCLE_FOREARMS: {
    id: 'MUSCLE_FOREARMS',
    name: 'Forearms / Brachioradialis',
    category: 'forearms',
    parentGroup: 'forearms',
    aliases: ['forearms', 'forearm', 'brachioradialis', 'wrists'],
  },

  // LEGS
  MUSCLE_QUADS: {
    id: 'MUSCLE_QUADS',
    name: 'Quadriceps (Quads)',
    category: 'legs',
    parentGroup: 'legs',
    aliases: ['quads', 'quadriceps', 'quad', 'front thigh', 'legs'],
  },
  MUSCLE_HAMSTRINGS: {
    id: 'MUSCLE_HAMSTRINGS',
    name: 'Hamstrings',
    category: 'legs',
    parentGroup: 'legs',
    aliases: ['hamstrings', 'hamstring', 'rear thigh', 'legs'],
  },
  MUSCLE_GLUTES: {
    id: 'MUSCLE_GLUTES',
    name: 'Gluteus Maximus (Glutes)',
    category: 'legs',
    parentGroup: 'legs',
    aliases: ['glutes', 'gluteus', 'glute', 'butt', 'hips', 'legs'],
  },
  MUSCLE_CALVES: {
    id: 'MUSCLE_CALVES',
    name: 'Gastrocnemius & Soleus (Calves)',
    category: 'legs',
    parentGroup: 'legs',
    aliases: ['calves', 'calf', 'gastrocnemius', 'soleus', 'legs'],
  },

  // CORE / ABS
  MUSCLE_RECTUS_ABDOMINIS: {
    id: 'MUSCLE_RECTUS_ABDOMINIS',
    name: 'Rectus Abdominis (Abs / Upper & Lower Abs)',
    category: 'core',
    parentGroup: 'core',
    aliases: ['abs', 'core', 'rectus abdominis', 'six pack', 'upper abs', 'lower abs', 'waist'],
  },
  MUSCLE_OBLIQUES: {
    id: 'MUSCLE_OBLIQUES',
    name: 'External & Internal Obliques',
    category: 'core',
    parentGroup: 'core',
    aliases: ['obliques', 'oblique', 'side abs', 'waist', 'core'],
  },
  MUSCLE_TRANSVERSE_ABDOMINIS: {
    id: 'MUSCLE_TRANSVERSE_ABDOMINIS',
    name: 'Transverse Abdominis (Deep Core)',
    category: 'core',
    parentGroup: 'core',
    aliases: ['deep core', 'transverse abdominis', 'tva', 'plank core', 'core'],
  },
};

/**
 * Returns canonical muscle IDs matching a target group or search string
 */
export function getCanonicalMuscleIds(groupOrName: string): string[] {
  const normalized = groupOrName.toLowerCase().trim();
  const matchedIds: string[] = [];

  for (const [id, def] of Object.entries(MUSCLE_TAXONOMY)) {
    if (
      def.parentGroup.toLowerCase() === normalized ||
      def.category.toLowerCase() === normalized ||
      def.aliases.some((alias) => alias.toLowerCase() === normalized || normalized.includes(alias.toLowerCase()))
    ) {
      matchedIds.push(id);
    }
  }

  return matchedIds.length > 0 ? matchedIds : ['MUSCLE_' + normalized.toUpperCase().replace(/\s+/g, '_')];
}

/**
 * Checks if a candidate exercise primary muscle matches any requested canonical targets
 */
export function isPrimaryMuscleMatch(exercisePrimaryMuscles: string[], requestedTargetGroups: string[]): boolean {
  const requestedCanonicalIds = new Set<string>();

  for (const group of requestedTargetGroups) {
    const ids = getCanonicalMuscleIds(group);
    ids.forEach((id) => requestedCanonicalIds.add(id));
  }

  return exercisePrimaryMuscles.some((exPrimary) => {
    // Exact match on canonical ID
    if (requestedCanonicalIds.has(exPrimary)) return true;

    // Fuzzy match on taxonomy parent group or category
    const def = MUSCLE_TAXONOMY[exPrimary];
    if (def) {
      return requestedTargetGroups.some((req) => {
        const reqNorm = req.toLowerCase().trim();
        return (
          def.parentGroup.toLowerCase() === reqNorm ||
          def.category.toLowerCase() === reqNorm ||
          def.aliases.some((a) => a.toLowerCase() === reqNorm)
        );
      });
    }

    return false;
  });
}
