# 🔧 Setup Instructions

## Quick Setup Guide

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Study_Companion

# Install frontend dependencies
npm install

# Install backend dependencies
cd StudyCompanionBackend
npm install
```

### 2. Configure Environment Variables

#### Backend (OpenAI API)

```bash
cd StudyCompanionBackend
cp env.example .env
```

Edit `.env` file:

```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
PORT=8080
NODE_ENV=development
```

#### Frontend (Firebase)

Edit `Study_Companion/Configs/firebaseConfig.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-firebase-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
};
```

### 3. Start the Application

```bash
# Terminal 1: Start backend server
cd StudyCompanionBackend
node index.js

# Terminal 2: Start frontend
cd Study_Companion
npx expo start
```

### 4. Update IP Address (if needed)

If running on a different machine, update the IP address in these files:

- `Study_Companion/app/(drawers)/notesHome.tsx` (line 24)
- `Study_Companion/app/(notes)/addNote.tsx` (line 18)

Change `192.168.68.117` to your machine's IP address.

## 🔑 Getting API Keys

### OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/Login
3. Go to API Keys section
4. Create a new API key
5. Copy and paste into your `.env` file

### Firebase Configuration

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Go to Project Settings > General
6. Scroll down to "Your apps" and add a web app
7. Copy the configuration object
8. Replace the values in `firebaseConfig.ts`

## 🚨 Important Security Notes

- ✅ **DO**: Use environment variables for API keys
- ✅ **DO**: Keep `.env` files in `.gitignore`
- ❌ **DON'T**: Commit API keys to version control
- ❌ **DON'T**: Share your `.env` files

## 🐛 Troubleshooting

### Backend Issues

- **"OPENAI_API_KEY environment variable is required!"**: Make sure you created the `.env` file with your API key
- **Port already in use**: Change the PORT in your `.env` file

### Frontend Issues

- **Firebase connection errors**: Check your Firebase configuration
- **Network errors**: Make sure the backend IP address is correct
- **Permission errors**: Check that camera/microphone permissions are granted

### General Issues

- **Dependencies not installing**: Try deleting `node_modules` and running `npm install` again
- **Expo issues**: Try clearing Expo cache with `npx expo start --clear`
