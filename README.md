# Study Companion 📚

A comprehensive mobile study companion app built with React Native and Expo, featuring AI-powered note organization, OCR scanning, voice transcription, and Pomodoro focus sessions.

## 🚀 What is Study Companion?

Study Companion is a mobile application designed to enhance your study experience through intelligent note-taking, organization, and focus management. The app combines traditional note-taking with modern AI capabilities to automatically classify and organize your study materials.

## ✨ Features

### 📝 Smart Note Management

- **Create, edit, and delete notes** with rich text support
- **AI-powered subject classification** - automatically categorizes notes into subjects like Mathematics, Science, History, Literature, Business, Technology, etc.
- **Tagging system** for custom organization and filtering
- **Real-time synchronization** across devices using Firebase

### 🤖 AI-Powered Features

- **Smart Subject Classification**: Uses OpenAI GPT-3.5-turbo to analyze note content and automatically assign the most appropriate subject category
- **OCR Text Recognition**: Scan handwritten or printed notes using your camera or photo library, powered by Tesseract.js
- **Voice-to-Text Transcription**: Record audio notes and convert them to text using OpenAI Whisper
- **Intelligent Organization**: Notes are automatically grouped by AI-determined subjects for easy browsing

### 📊 Analytics Dashboard

- **Visual pie chart** showing distribution of notes by subject
- **Study statistics** including total notes created
- **Pomodoro session tracking** with work/break time analytics

### ⏰ Pomodoro Focus Timer

- **Customizable work/break intervals** and session cycles
- **Local notifications** and haptic feedback for session transitions
- **Progress tracking** with cumulative statistics saved to cloud
- **Visual timer** with start/pause/reset functionality

### 🔐 User Authentication

- **Secure email/password registration and login**
- **User-specific data isolation** ensuring privacy
- **Persistent sessions** with automatic login state management

## 🛠️ Technology Stack

### Frontend

- **React Native 0.79** with **React 19**
- **Expo SDK 53** with **Expo Router** for navigation
- **Firebase Web SDK** for authentication, database, and analytics
- **TypeScript** for type safety

### Backend

- **Node.js** with **Express.js** server
- **OpenAI API** for AI features (GPT-3.5-turbo, Whisper)
- **Tesseract.js** for OCR functionality
- **Multer** for file upload handling

### Key Libraries & Dependencies

#### Frontend Libraries

- **Navigation**: `expo-router`, `@react-navigation/*`, `react-native-gesture-handler`
- **UI Components**: `@expo/vector-icons`, `react-native-picker`, `react-native-pie-chart`
- **Media & Device**: `expo-image-picker`, `expo-audio`, `expo-notifications`, `expo-haptics`
- **Data Management**: `firebase` (Auth, Firestore)
- **Utilities**: `expo-constants`, `expo-status-bar`, `expo-toast`

#### Backend Libraries

- **Server**: `express`, `cors`
- **AI/ML**: `openai`, `tesseract.js`
- **File Handling**: `multer`, `fs`

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+), npm, Expo CLI
- Firebase project with Auth & Firestore
- OpenAI API key

### Quick Setup

1. **Clone & Install**

   ```bash
   git clone https://github.com/V-Shah07/Study-Companion.git
   cd Study_Companion
   npm install
   cd StudyCompanionBackend && npm install
   ```

2. **Configure APIs**

   - Firebase: Update `Study_Companion/Configs/firebaseConfig.ts`
   - OpenAI: Create `StudyCompanionBackend/.env` with `OPENAI_API_KEY=your_key`

3. **Run**

   ```bash
   # Terminal 1: Backend
   cd StudyCompanionBackend && node index.js

   # Terminal 2: Frontend
   cd Study_Companion && npx expo start
   ```

## 📱 Usage

1. **Register/Login** with email and password
2. **Create notes** manually or use AI features:
   - Tap camera icon to scan handwritten notes
   - Tap microphone to record voice notes
   - AI will automatically classify subject
3. **Organize** notes using tags and subject filtering
4. **Track focus** with Pomodoro timer
5. **View analytics** on the dashboard
