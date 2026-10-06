# Development setup

## Prerequisites

- Node.js and npm compatible with the Expo SDK/dependency versions in
  `package.json`/`package-lock.json`. There is no `engines` declaration, so
  the project does not specify a precise Node.js release.
- Android Studio/Android SDK and a JDK/Gradle environment compatible with the
  checked-in Android project.
- Android emulator or physical Android device for app execution.
- Firebase project with Email/Password Authentication enabled only if login
  or account creation is required.

## Install and start

Run these commands from the **project root**:

```powershell
npm install
npm run android
npm start
```

The app depends on native ONNX Runtime; Expo Go does not contain that module.
`npm run android` invokes `expo run:android` for a custom native development
client; `npm start` invokes Expo with `--dev-client`. Use
`npm run ios` only with an iOS/Xcode environment; Android is the primary
configured target. `npm run web` exists, but native inference behavior is not
available in an ordinary web browser.

For a physical Android device, enable Developer options/USB debugging, connect
it, and accept the debugging authorization prompt. Camera/gallery access
requires granting the runtime permissions declared/configured by Expo.

## Firebase configuration

`src/services/authService.js` reads these Expo public client variables:

```text
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

The current checkout has a local `.env.local`, but this document deliberately
does not inspect or reproduce its values. `.env.example` is absent. Create a
local ignored env file for development as needed; do not commit private
credentials, service-account files, passwords, or tokens. Firebase client
configuration is intended for the client app but should still be protected
with suitable Firebase project restrictions/rules. Guest and local model
functionality can run without Firebase configuration.

## Tests and lint

From the **project root**:

```powershell
npm test -- --runInBand
npm run lint
```

Jest uses `jest-expo`; `jest.setup.js` configures a local AsyncStorage mock.

## Android export and native debug build

First export JavaScript/assets from the **project root**:

```powershell
npx expo export --platform android
```

Then build the Android debug APK from **`android/`**:

```powershell
cd android
.\gradlew.bat assembleDebug
```

Do not run Expo export from the Android directory. The generated APK is
normally under `android/app/build/outputs/apk/debug/`.

## Environment and secrets

`.gitignore` ignores `.env` and `.env.*` but explicitly allows `.env.example`.
There is no example env file committed at present. Never add real secret
values to README/docs, source, screenshots, test output, or commits. Avoid
placing Firebase service-account credentials in a mobile app; the project
uses public client configuration for Firebase Authentication.
