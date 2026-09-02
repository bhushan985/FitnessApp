# API Documentation — Regional AI Diet & Fitness Assistant

Base URL: `http://localhost:5000/api`
Swagger / OpenAPI interactive UI: `http://localhost:5000/api-docs`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123"
}
```

### `POST /api/auth/login`
Authenticate user credentials and issue JWT access token.

---

## 2. User Profile & Nutrition Targets

### `GET /api/profile`
Fetch current user's profile and calculated target macros.

### `PUT /api/profile`
Update user stats (weight, height, activity level, fitness goal, diet type, allergies) and auto-recalculate target calories & macros.

---

## 3. Regions & Regional Foods

### `GET /api/regions`
Fetch available regional hubs (e.g. Maharashtra -> Mumbai, Pune, Nagpur).

### `GET /api/foods`
Search master food database by category (`breakfast`, `lunch`, `dinner`, `snack`) and dietary type (`veg`, `non_veg`, `eggetarian`).

---

## 4. Personalized 5-Slot Meal Plan Generation

### `POST /api/meal-plans/generate`
Trigger AI solver to generate today's 5-slot meal plan (Breakfast, Mid Morning, Lunch, Evening Snack, Dinner) matching target macros.

### `GET /api/meal-plans/today`
Fetch today's active meal plan along with items and "Why Recommended" explanation checklists.

---

## 5. Progress & Analytics

### `GET /api/progress/analytics?days=7`
Fetch historical weight trend line, calorie intake history, and protein target completion percentage.
