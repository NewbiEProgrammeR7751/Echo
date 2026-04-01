# Echo App

## Run locally

```bash
npm install
npm run dev
```

## Firebase setup (required)
1. Create a Firebase project
2. Create a **Web app** in Firebase (Project settings → General → Your apps)
3. Enable **Authentication** → **Email/Password**
4. Create a `.env` file in the project root (use `.env.example`)

### Firestore rules (MVP)
For quick testing you can start with authenticated-only rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Build

```bash
npm run build
npm run preview
```

## Publish (no backend)

This is a static Vite + React app. Publishing means deploying the `dist/` folder that `npm run build` generates.

### Vercel
- Import the repo in Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

SPA refresh support is included via `vercel.json`.

### Netlify
- New site from Git
- **Build command**: `npm run build`
- **Publish directory**: `dist`

SPA refresh support is included via `netlify.toml` (and `public/_redirects`).

### GitHub Pages (optional)
If you want GitHub Pages, you must set Vite `base` to your repo name (example: `/echo-app/`) in `vite.config.js`.

## Publish to Google Play (Android)

This project is wrapped as a native Android app using Capacitor in the `android/` folder.

### Prereqs (Windows)
- Install **Android Studio**
- In Android Studio: install an **SDK** + **Build Tools** (default is fine)

### Build and open Android project

```bash
npm run cap:sync
npm run cap:open:android
```

### Create an App Bundle (AAB) for Play Console
In Android Studio:
- **Build** → **Generate Signed Bundle / APK…**
- Choose **Android App Bundle**
- Create/select a **keystore**
- Build **Release**

Then upload the resulting `.aab` to **Google Play Console** (Internal testing is the easiest first track).

