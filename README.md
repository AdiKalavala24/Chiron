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

## Setip
npm install

## Running with EAS Build

Use [EAS Build](https://docs.expo.dev/build/introduction/) when you want
to build on Expo's servers instead of locally. This is especially useful
if your Mac doesn't have **Xcode 26.4+** (required for Expo SDK 57) or
you want to install the app on a physical device without a local native
build.

### Prerequisites

- An [Expo account](https://expo.dev/signup)
- EAS CLI: `npm install -g eas-cli`
- For device installs: an [Apple Developer](https://developer.apple.com/)
  account (EAS will prompt you to set up credentials on first build)

### First-time setup

```bash
npm install
eas login
```

The project is already linked to EAS (`app.json` → `extra.eas.projectId`)
and has build profiles in `eas.json`.

### Build a development client

The `development` profile builds a custom dev client you can install on
a simulator or device:

```bash
eas build --platform ios --profile development
```

When the build finishes, follow the link in the terminal or on
[expo.dev](https://expo.dev) to install it. Then start the JS bundler:

```bash
npx expo start --dev-client
```

Open the installed Chiron app and connect to the dev server.

### Other build profiles

```bash
# Internal test build (no dev menu)
eas build --platform ios --profile preview

# App Store / TestFlight build
eas build --platform ios --profile production
```

Submit to TestFlight after a production build:

```bash
eas submit --platform ios --profile production
```

### Lockfile requirements

EAS runs `npm ci`, so `package.json` and `package-lock.json` must be in
sync and committed before you build. If a cloud build fails during
"Install dependencies", regenerate the lockfile with the same npm version
EAS uses and push again:

```bash
rm -rf node_modules package-lock.json
npx npm@10.9.8 install
git add package.json package-lock.json
git commit -m "Sync lockfile for EAS"
git push
eas build --platform ios --profile development --clear-cache
```

### Environment variables on EAS

To use Gemini features in cloud builds, set `EXPO_PUBLIC_GEMINI_API_KEY`
as an EAS secret (not in git):

```bash
eas secret:create --name EXPO_PUBLIC_GEMINI_API_KEY --value your-key-here --type string
```

Or add it in the [Expo dashboard](https://expo.dev) under your project's
environment variables.

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
