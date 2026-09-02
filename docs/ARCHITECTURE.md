# System Architecture — Regional AI Diet & Fitness Application

```text
               MOBILE USER APP (React/TS + Tailwind)        ADMIN DASHBOARD (React/TS + Tailwind)
                         \                                            /
                          \                                          /
                           \── HTTPS / REST API ── JWT Auth ────────/
                                        │
                                        ▼
                             NODE.JS + EXPRESS API SERVER (TS)
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             │                          │                          │
             ▼                          ▼                          ▼
     Authentication           Nutrition Engine           AI Recommendation Engine
  (JWT, bcrypt, Audit)     (BMR/TDEE/Macros)         (Multi-variable scoring & solver)
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        │
                                        ▼
                            MONGODB + MONGOOSE MODELS
       (Users, UserProfiles, Regions, Foods, FoodRegions, MealPlans,
        MealPlanItems, MealLogs, Recommendations, Feedback, AuditLogs)
```

## Key Architectural Principles

1. **Separation of Concerns**: Clean isolation of Routes -> Controllers -> Services -> Models.
2. **Personalized Nutrition Engine**: Implements Mifflin-St Jeor equation to derive BMR & TDEE based on activity levels and fitness goals (weight loss, weight gain, muscle building, maintenance).
3. **Region-Aware Recommendation Solver**: Multivariable scoring algorithm considering regional availability, authentic recipes, local popularity, macro alignment, user feedback history, and strict allergy/diet filters.
4. **Embedded Database Runtime**: Built-in zero-config `mongodb-memory-server` fallback for instant out-of-the-box local execution.
