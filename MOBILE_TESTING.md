# NutriRegion — Mobile & Multi-Device Local LAN Testing & Production Guide

This guide explains how to run, test, and access the NutriRegion MERN application from your physical smartphone, tablet, or any device connected to the same Wi-Fi network, as well as how to deploy to production.

---

## 🌐 1. Local Network (Wi-Fi LAN) Architecture

When testing on your phone:
- Your development PC acts as the local API & web server on your Wi-Fi network.
- Your phone connects to your PC's **IPv4 Address** (e.g. `http://192.168.0.122:3000`).
- Frontend requests automatically route to the Express API (`http://192.168.0.122:5000/api`), which connects to MongoDB Atlas.

```text
[ Physical Phone Browser ] ──(Wi-Fi LAN)──> [ Dev PC: 192.168.0.122:3000 (Vite) ]
                                                    │
                                                    ▼
                                            [ Express API: 5000 ]
                                                    │
                                                    ▼
                                            [ MongoDB Atlas Cloud ]
```

---

## 🔍 2. How to Find Your PC's LAN IPv4 Address

On Windows:
1. Open Command Prompt (`cmd`) or PowerShell.
2. Run:
   ```cmd
   ipconfig
   ```
3. Locate **Wireless LAN adapter Wi-Fi** or **Ethernet adapter**.
4. Look for **IPv4 Address** (Example: `192.168.0.122`).

---

## 🚀 3. Steps to Run Applications for Mobile Testing

### Step 1: Start the Backend Express Server
In a terminal:
```bash
cd backend
npm run build
npm start
```
*The Express server will bind to `0.0.0.0:5000`, accepting requests from any device on your Wi-Fi.*

---

### Step 2: Start the Mobile Frontend App
In a second terminal:
```bash
cd mobile
npm run dev
```
*Vite will output LAN access URLs, for example: `http://192.168.0.122:3000`.*

---

### Step 3: Start the Admin Dashboard (Optional)
In a third terminal:
```bash
cd admin
npm run dev
```
*Accessible on LAN: `http://192.168.0.122:3001`.*

---

##📱 4. Opening on Your Phone

1. Connect your smartphone to the **same Wi-Fi network** as your PC.
2. Open Chrome / Safari on your phone.
3. Enter the URLs:
   - **NutriRegion Mobile App**: `http://192.168.0.122:3000`
   - **Admin Dashboard**: `http://192.168.0.122:3001`
   - **Backend API Health Check**: `http://192.168.0.122:5000/api/health`

---

## 🛡️ 5. Windows Firewall Troubleshooting

If your phone displays "Connection Timed Out" or cannot open the page:
1. Open **Windows Defender Firewall** -> **Advanced Settings**.
2. Click **Inbound Rules** -> **New Rule**.
3. Select **Port** -> Next.
4. Select **TCP** and specify ports: `5000, 3000, 3001` -> Next.
5. Select **Allow the connection** -> Next -> Check Domain, Private, Public -> Name it `NutriRegion Local Testing` -> Finish.

---

## ☁️ 6. Production Deployment Setup

For full internet access across any device worldwide without relying on your PC:

### 1. Database (MongoDB Atlas)
- Create a Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Set Network Access IP Whitelist to `0.0.0.0/0`.
- Obtain production URI: `mongodb+srv://<username>:<password>@cluster.mongodb.net/nutriregion`

### 2. Backend API (Render / Railway / Render / DigitalOcean)
- Environment Variables to set on host:
  - `PORT=5000`
  - `MONGODB_URI=mongodb+srv://...`
  - `JWT_SECRET=your_production_secret`
  - `ALLOWED_ORIGINS=https://your-mobile-app.vercel.app,https://your-admin.vercel.app`
- Production Build Command: `npm run build`
- Production Start Command: `npm start`

### 3. Mobile & Admin Frontend (Vercel / Netlify)
- Environment Variables to set on host:
  - `VITE_API_URL=https://your-backend-api.onrender.com/api`
- Build Command: `npm run build`
- Output Directory: `dist`
