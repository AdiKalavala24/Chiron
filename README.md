# Chiron

An adaptive learning companion for kids — the "counselor's instinct" from a
great camp counselor, built into an AI tutor. It doesn't just grade answers;
it reads hesitation, rushed guesses, and winning streaks, and changes how it
teaches in real time instead of grinding through a fixed lesson plan.

This repo is the frontend MVP: a React Native (Expo) app implementing the
**Playful Geometric** design system end-to-end, plus a working (if currently
mocked) adaptive engine you can actually interact with.

## Stack

- **React Native + Expo** (SDK 57, TypeScript, expo-router, New Architecture)
- **Gemini** — intended LLM for the tutor persona (currently mocked, see below)
- **YOLO** — intended computer-vision signal for the "physical objects on a
  desk" concept from the design notes (currently mocked, see below)
- **Postgres** — intended backend datastore (schema sketched, no server yet)

## Getting started

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web) in the
terminal, or scan the QR code with Expo Go.

## What's actually implemented vs. stubbed

**Implemented and running:**
- The full design token system (`src/constants/theme.ts`) — colors, the
  1.25-ratio type scale, radii, the flat "pop" shadow, spacing, motion.
- Reusable primitives in `src/components/ui/`: `PrimaryButton` /
  `SecondaryButton` (the "Candy Button"), `StickerCard`, `TextField`,
  `Badge`, `IconBadge`, and decorative shapes (`Blob`, `Squiggle`,
  `ConfettiField`, `DotGrid`, `CircleDecoration`) built on `react-native-svg`.
  All respect `prefers-reduced-motion` via Reanimated's `useReducedMotion`.
- The **adaptive engagement engine** (`src/adaptive/`) — a real, working
  implementation of the "counselor's instinct" idea: it derives
  `engaged | frustrated | bored | celebrating` from answer-timing and
  correctness patterns (no camera or wearable required for this v1), and the
  Lesson screen visibly changes tone, color, and question difficulty based on
  it. This is genuinely running, not cosmetic.
- The **parent debrief** (`src/adaptive/debrief.ts`) — generates a specific,
  human summary from the session's actual event history ("she lit up on X,
  hesitated on Y"), instead of a progress-bar dashboard.
- Three screens wired together end to end: **Home**, **Lesson** (the
  interactive adaptive demo), **Debrief**.

**Deliberately stubbed** (interfaces are real, implementations are mocks —
see the comments in each file for exactly what to wire up):
- `src/services/llm.ts` — Gemini tutor client. Should be called through a
  backend proxy, never directly from the client with an embedded API key.
- `src/services/vision.ts` — YOLO object-detection client. On-device vs.
  server-side inference is an open tradeoff noted in the file, not decided
  here.
- `src/services/api.ts` — REST client for the Postgres-backed backend.
  `server/schema.sql` sketches the data model these calls would hit; no
  server implementation exists yet.

## Project structure

```
src/
  app/                 expo-router screens (index, lesson, debrief) + tab layout
  adaptive/            the engagement engine, adaptive theming, debrief generation
  components/
    ui/                design-system primitives (button, card, input, shapes, ...)
  constants/theme.ts   design tokens — single source of truth
  services/            stubbed Gemini / YOLO / Postgres API clients
server/
  schema.sql           Postgres schema sketch (no server implementation yet)
```
