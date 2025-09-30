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

## 🏗️ Architecture & Implementation

### AI Features Implementation

#### Smart Subject Classification

```javascript
// Frontend: addNote.tsx
const classifySubject = async () => {
  const response = await fetch(`${API_URL}/classify-note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, note }),
  });
  return response.json();
};

// Backend: OpenAI Chat Completions
openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    /* classification prompt */
  ],
});
```

#### OCR Text Recognition

```javascript
// Frontend: Camera/Photo picker → Base64
const response = await fetch(`${API_URL}/ocr`, {
  method: "POST",
  body: JSON.stringify({ imageBase64 }),
});

// Backend: Tesseract.js processing
Tesseract.recognize(imageData, "eng").then((result) => {
  res.json({ text: result.data.text });
});
```

#### Voice Transcription

```javascript
// Frontend: Audio recording → FormData upload
const formData = new FormData();
formData.append("audio", { uri: audioUri, type: "audio/m4a" });

// Backend: OpenAI Whisper
openai.audio.transcriptions.create({
  file: audioStream,
  model: "whisper-1",
});
```

### Data Architecture

- **Firestore Collections**:
  - `notes`: `{ title, note, subject, tags[], uid }`
  - `users`: `{ totalSessions, totalWorkTime, totalBreakTime }`
- **Real-time synchronization** using Firestore `onSnapshot`
- **User-scoped data access** with Firebase security rules

### Navigation Structure

```
app/
├── _layout.tsx (Root Stack)
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (drawers)/
│   ├── _layout.tsx (Drawer Navigation)
│   ├── home.tsx (Dashboard)
│   ├── notesHome.tsx (Notes List)
│   └── pomodoro.tsx (Focus Timer)
└── (notes)/
    ├── addNote.tsx
    └── updateNote.tsx
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Simulator** (for iOS development) or **Android Studio** (for Android)
- **Firebase project** with Authentication and Firestore enabled
- **OpenAI API key** for AI features

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Study_Companion
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd StudyCompanionBackend
   npm install
   ```

4. **Configure Firebase**

   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password) and Firestore Database
   - Copy your Firebase config to `Study_Companion/Configs/firebaseConfig.ts`
   - Replace the placeholder values with your actual Firebase configuration

5. **Configure OpenAI API**

   - Get your API key from [platform.openai.com](https://platform.openai.com)
   - Create a `.env` file in the `StudyCompanionBackend` directory:

   ```bash
   cd StudyCompanionBackend
   cp env.example .env
   ```

   - Edit `.env` and add your OpenAI API key:

   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=8080
   ```

6. **Start the backend server**

   ```bash
   cd StudyCompanionBackend
   node index.js
   ```

   Server will run on `http://localhost:8080`

7. **Start the Expo development server**

   ```bash
   cd Study_Companion
   npx expo start
   ```

8. **Run on device/simulator**
   - Scan QR code with Expo Go app (mobile)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

### Environment Setup

#### Firebase Configuration

```typescript
// Study_Companion/Configs/firebaseConfig.ts
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
};
```

#### Backend Configuration

```bash
# StudyCompanionBackend/.env
OPENAI_API_KEY=sk-your-openai-api-key
PORT=8080
NODE_ENV=development
```

### Development Notes

- **Backend IP**: Update the hardcoded IP address (`192.168.68.117`) in frontend files to match your development machine's IP
- **CORS**: Backend has permissive CORS for development; restrict for production
- **Environment Variables**: All sensitive keys are now stored in environment variables (`.env` files) and are not committed to the repository

## 📱 Usage

1. **Register/Login** with email and password
2. **Create notes** manually or use AI features:
   - Tap camera icon to scan handwritten notes
   - Tap microphone to record voice notes
   - AI will automatically classify subject
3. **Organize** notes using tags and subject filtering
4. **Track focus** with Pomodoro timer
5. **View analytics** on the dashboard

## 🔒 Security Considerations

- **Environment Variables**: All API keys are stored in `.env` files and excluded from version control
- **Firebase Security**: Firebase security rules should restrict data access to authenticated users only
- **CORS Configuration**: Backend CORS should be configured for specific domains in production
- **Data Isolation**: User data is isolated by Firebase Authentication UID
- **API Key Protection**: OpenAI API keys are never exposed in the codebase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT and Whisper APIs
- Tesseract.js for OCR capabilities
- Expo team for the excellent React Native framework
- Firebase for backend services

---

**Built with ❤️ for students everywhere**
