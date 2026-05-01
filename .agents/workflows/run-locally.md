---
description: How to run the AI Student Chatbot locally
---

This workflow helps you get the project up and running in your local environment.

1. **Verify Environment Variables**
   Ensure you have a `.env.local` file in the root directory. If not, copy `.env.local.example` to `.env.local`.
   ```powershell
   copy .env.local.example .env.local
   ```
   *Note: You must manually fill in your API keys in .env.local.*

2. **Install Dependencies**
   If this is your first time, run:
   ```powershell
   npm install
   ```

// turbo
3. **Start Development Server**
   Run the dev server on port 3000.
   ```powershell
   npm run dev
   ```

4. **Verify Application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

5. **Troubleshooting Ports**
   If port 3000 is occupied, you can kill the existing process:
   ```powershell
   netstat -ano | findstr :3000
   # Replace <PID> with the ID found above
   taskkill /F /PID <PID>
   ```
