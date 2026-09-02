# Database Schema & Models — MongoDB + Mongoose

## Collections Summary

1. `users`: User authentication credentials, roles (`user`, `admin`, `super_admin`), status (`active`, `blocked`).
2. `user_profiles`: User physical stats, diet preferences, allergies, daily calorie & macro targets, region link.
3. `regions`: Country, State, City, RegionName hierarchy.
4. `foods`: Master foods database with nutritional breakdown per serving, ingredients, preparation method.
5. `food_regions`: Junction collection connecting foods to specific regions with availability & popularity scores (1-10) and local price.
6. `meal_plans` & `meal_plan_items`: 5-slot generated plans (Breakfast, Mid Morning, Lunch, Evening Snack, Dinner) with scaled portion quantities ($g$).
7. `meal_logs`: Consumption logs tracking consumed calories & macros.
8. `recommendations` & `recommendation_feedback`: AI scoring breakdown, reasons checklist, and feedback ratings (liked/disliked/consumed) powering recommendation learning loop.
9. `audit_logs`: Administrative actions and security audit log entries.
