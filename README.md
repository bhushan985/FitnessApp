# Regional AI Diet & Fitness Application — Full-Stack Production Build

A production-ready regional personalized diet & fitness assistant featuring personalized nutrition target calculation, region-aware food recommendation scoring, automated 5-slot meal plan generation, meal logging, progress tracking, recommendation feedback learning loops, mobile user app, and an admin management dashboard.

---

## 🌟 Key Features

1. **User Authentication & Authorization**: JWT token auth, Refresh tokens, bcrypt password hashing, Role-Based Access Control (`user`, `admin`, `super_admin`).
2. **Onboarding & Location Detection**: Automatic GPS/Region hub selection (Maharashtra -> Mumbai, Pune, Nagpur, Nashik; Gujarat -> Ahmedabad; Delhi -> New Delhi; Karnataka -> Bengaluru).
3. **Personalized Nutrition Engine**: BMR (Mifflin-St Jeor) & TDEE calculation derived from age, height, weight, activity level, and fitness goals (weight loss, weight gain, muscle building, maintenance).
4. **Regional Food Database & Scoring**: Multivariable AI recommendation engine scoring candidate foods by region availability, authentic local recipes, macro alignment, preference match, and strict allergy/diet exclusions.
5. **Automated 5-Slot Meal Plan Generator**: Solver building Breakfast, Mid Morning, Lunch, Evening Snack, and Dinner scaling candidate portion sizes ($g$) to hit daily macro goals.
6. **Meal Logging & Progress Analytics**: Meal consumption tracker with progress charts for Weight Trend, Calorie Intake, and Protein completion (7d/30d/90d views).
7. **Recommendation Feedback Loop**: Like/Dislike/Skip ratings updating user preference weights for future plan generation.
8. **Admin Management Portal**: Web admin dashboard featuring KPI metrics, User Growth line chart, Regional Distribution donut chart, Recent Users table with status toggling, and full Food CRUD.

---

## 📁 Repository Structure

```text
FitnessApp/
├── backend/            # Express.js + TypeScript API Server & Mongoose Models
├── mobile/             # React + TypeScript + Tailwind Mobile User Application
├── admin/              # React + TypeScript + Recharts Web Admin Dashboard
├── docs/               # API, Architecture, and Database Documentation
├── .env.example        # Environment variables template
└── README.md
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js v18+ and npm installed.

### 1. Start Backend API Server
```bash
cd backend
npm run dev
```
*The API server will launch at `http://localhost:5000` with MongoMemoryServer & auto-seed authentic regional foods & test users.*
- **API Health Check**: `http://localhost:5000/api/health`
- **Swagger Docs**: `http://localhost:5000/api-docs`

### 2. Start Mobile User App
```bash
cd mobile
npm run dev
```
*Open `http://localhost:3000` to interact with the mobile app.*

### 3. Start Admin Web Dashboard
```bash
cd admin
npm run dev
```
*Open `http://localhost:3001` to access the Admin Management Portal.*

---

## 🧪 Credentials for Testing

- **Demo User Account**:
  - Email: `rahul@example.com`
  - Password: `password123`

- **Admin Account**:
  - Email: `admin@fitnessapp.com`
  - Password: `password123`
