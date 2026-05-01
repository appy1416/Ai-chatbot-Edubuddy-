# 🚀 AI Student Chatbot - Run Commands

This file contains documented commands for setting up, running, and managing the AI Student Chatbot project.

## 🛠 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18.x or above)
- npm (comes with Node.js)

## 📦 Setup & Installation

1. **Install Dependencies**
   Run this to install all necessary packages.
   ```powershell
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.local.example` to `.env.local`.
   ```powershell
   copy .env.local.example .env.local
   ```
   - Open `.env.local` and add your keys for:
     - `GEMINI_API_KEY` (Get from Google AI Studio)
     - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Get from Supabase)

---

## 🏃 Running the Application

### Development Mode
Runs the app on [http://localhost:3000](http://localhost:3000) with hot-reloading.
```powershell
npm run dev
```
*Note: If port 3000 is in use, Next.js will automatically try 3001, 3002, etc.*

### Production Build
Build the application for deployment.
```powershell
npm run build
```

### Start Production Server
Run the built application.
```powershell
npm run start
```

---

## 🧪 Testing & Utilities

### Test Gemini API Connection
Run the following scripts to verify your AI integration:
```powershell
node test-gemini-key.js
node test-gemini.js
node list-models.js
```

### Linting
Check for code quality and potential errors.
```powershell
npm run lint
```

---

## 🔧 Troubleshooting

### Port Already in Use
If you encounter `Port 3000 is in use`, you can find and kill the process using:
```powershell
# Find process running on 3000
netstat -ano | findstr :3000
# Kill process by PID (Replace <PID> with number from command above)
taskkill /F /PID <PID>
```

### Clearing Next.js Cache
If the app is behaving weirdly after changes, try deleting the `.next` folder.
```powershell
Remove-Item -Recurse -Force .next
```
