# Chiron

An iOS-first adaptive learning app for grades K–4, built with Expo Router.
Kids pick a grade and subject, work through a hardcoded skill path using
whichever teaching method (questions, video, a voice chatbot tutor,
tracing, speaking practice, "teach the pet," story missions, or a 3D
game) fits how they're doing, and parents get a counselor-style
narrative debrief instead of a scoreboard.

## Prerequisites

- Node 20+, Xcode with an iOS Simulator (or a physical device) — this
  project targets iOS only.
- This app uses several native modules (camera, on-device speech
  recognition, MMKV, Expo GL/Three.js for the 3D games) that **do not
  run in Expo Go**. You need a custom dev client.

## Setup

```bash
npm install
cp .env.example .env   # optional — see below
npx expo run:ios       # builds and launches the dev client in the simulator
```

Once the dev client is installed, `npx expo start` will reconnect to it
for subsequent runs.

### Gemini API key (optional)

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_GEMINI_API_KEY` (get
one at https://aistudio.google.com/apikey) to enable:

- "More practice" lesson generation on top of the 20 hardcoded curriculum paths
- The parent-facing narrative debrief and guidance recommendations

Without a key, the app runs entirely on the hardcoded curriculum and a
templated offline debrief — nothing crashes or blocks; see
`src/features/gemini/*-generator.ts` for the fail-soft fallback logic.

## Project structure

```
app/                  Expo Router routes (Home, kid/*, parent/*)
src/theme/            Design tokens, ThemeProvider, motion presets
src/components/ui/    CandyButton, StickerCard, HardShadow, etc.
src/components/learning/  One component per teaching method + the dispatcher
src/components/games/ Shared R3F/Expo GL game shell + player
src/components/path/  Skill path map
src/features/         curriculum, adaptive, affect, gemini, parent domains
src/stores/           zustand + MMKV-persisted profile/progress/session state
content/paths/        The 20 hardcoded grade × subject curriculum paths
```

## Linting & type-checking

```bash
npm run lint
npx tsc --noEmit
```
