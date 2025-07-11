# 🏗 ARCHITECTURE.md

## 🧱 Project Structure Overview

This app is a **Note-taking application with AI-powered assistance**, built with modularity and scalability in mind.

### 📁 Folder Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React Context for Notes, Tags, and Theme
├── data/             # Static or initial data (if applicable)
├── hooks/            # Custom React hooks
├── lib/              # Utilities or third-party integrations
├── services/         # AI API Handlers
├── types/            # TypeScript type definitions
├── utils/            # General utility functions
├── App.tsx           # Main application wrapper
├── main.tsx          # App entry point
└── vite-env.d.ts     # Vite environment types
```

---

## ⚙️ State Management

### ✅ Local State (`useState`, `useReducer`)
Used for:
- Form inputs (e.g., note title, body, tag input)
- UI state (modals, dropdowns, clipboard copied flags)

### 🌐 Global State (via Context API)
- `NotesContext`: Manages notes data and CRUD operations.
- `TagsContext`: Handles note tagging and filtering.
- `ThemeContext`: Manages theme switching (light/dark).

> You’ve wisely organized contexts separately for clear responsibility and maintainability.

---

## 🤖 AI Feature Design

The AI feature lives under `services/` (Gemini integrations):

- `services/geminiServices.ts`: Handles all AI requests (e.g., summarization, code generation).
- `components/AIToolbar.tsx`: Displays AI-generated toolbar alongside notes.

---

## 🚀 Scaling Plan (10× Ready)

### 1. **Codebase Modularization**
- Continue keeping logic and views split. Consider `pages/` or `features/` folders for vertical slicing if needed.
- Encapsulate AI features into their own module for clean isolation.

### 2. **State Evolution**
- Replace or enhance Context with **Zustand** or **Redux Toolkit** if global state grows.
- Normalize state using `entities` shape for faster access and updates.

### 3. **Data Scaling**
- Add pagination/virtualization (`react-window`) for large note sets.
- Store AI prompt history separately or in IndexedDB/localStorage for faster lookups.

### 4. **API and AI Performance**
- Queue background AI requests if latency increases.
- Add debounce/throttle to AI prompt triggers to reduce usage.

### 5. **Team and CI**
- Add linting/formatting via Prettier + ESLint (already present 👍).
- Introduce testing via Vitest/Jest + React Testing Library.
- Setup GitHub Actions for CI: lint, test, build.

---

## ✅ Summary

This architecture already reflects best practices:
- Clean folder structure
- Context-based state isolation
- Future-ready separation of concerns

With minimal effort, this can scale to enterprise-grade usage while keeping dev experience smooth.
