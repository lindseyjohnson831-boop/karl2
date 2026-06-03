# KarlCheck

**Fog, verified by your neighbors.**

KarlCheck is a San Francisco fog-tracking app named after Karl — the city's beloved resident fog bank. It shows real-time fog conditions across every SF neighborhood, live camera feeds, and crowd-sourced photo reports from locals. Available as a native iOS app (built with Expo) and a responsive web app.

---

## Screenshots

### Web App — Desktop

![Desktop two-column layout](public/project/assets/sf-map-new.png)

> The desktop layout shows the interactive fog map on the left and a neighborhood detail sidebar on the right. Clicking any neighborhood reveals live cam feeds, fog score, temperature, wind, and visibility.

### Web App — Map Overview

Neighborhoods covered:
- **Foggy belt:** Sunset, Richmond, Golden Gate Park, Twin Peaks, Presidio
- **Partly cloudy:** Marina, Pacific Heights, Haight-Ashbury, SOMA, Noe Valley
- **Usually sunny:** The Mission, Castro, Bernal Heights, Dogpatch, Potrero Hill, North Beach, FiDi

Each neighborhood displays a live status badge (`KARL` / `MIST` / `PARTLY` / `SUN` / `WIND`) pinned to its location on the illustrated map.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Native iOS | React Native + Expo (SDK 54) |
| Web | Vanilla React 18 + Babel (CDN, no bundler) |
| WebView bridge | `react-native-webview` + `expo-file-system` |
| Hosting | Netlify (static) |

---

## Web App

### Local development

```bash
# Build the public/ output folder
npm run build:web

# Serve it locally
npx serve public
```

Open `http://localhost:3000` in your browser. Resize to ≥ 768 px wide for the full desktop two-column layout.

### How the build works

`npm run build:web` runs:
```bash
mkdir -p public/project/assets
cp assets/karlcheck.html public/index.html
cp assets/project/assets/*.png public/project/assets/
```

`karlcheck.html` is a self-contained app (React + Babel loaded from CDN) with relative image paths that work identically on the local filesystem and on a web server.

### Deploy to Netlify

1. Push this repo to GitHub (already done).
2. Connect the repo in the [Netlify dashboard](https://app.netlify.com).
3. Netlify picks up `netlify.toml` automatically:
   - **Build command:** `npm run build:web`
   - **Publish directory:** `public`
4. Set your custom domain — the share button will send visitors to `https://karlcheck.app`.

### Deploy to Vercel

```bash
npx vercel --prod
```

Set the output directory to `public` and the build command to `npm run build:web` in the Vercel project settings.

---

## iOS App

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Xcode (for iOS Simulator or device builds)
- An [Expo account](https://expo.dev) (free)

### Run in Expo Go (quickest)

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your iPhone.

### Run in iOS Simulator

```bash
npm install
npx expo start --ios
```

### Build a standalone IPA (EAS Build)

```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

This produces a signed `.ipa` ready for TestFlight or App Store submission. Configure `eas.json` with your Apple credentials before running.

### How the native app works

On launch, `App.js`:
1. Copies `assets/karlcheck.html` and all image assets from the app bundle into `FileSystem.documentDirectory`.
2. Opens a `react-native-webview` pointed at the local `file://` copy.
3. Injects `window.__KC_NATIVE__ = true` and `window.__KC_SHARE_URL__ = "https://karlcheck.app"` so the HTML knows it's running natively.

Images are served via relative paths from the same directory as the HTML file, which WKWebView can access once `allowingReadAccessToURL` is set to the parent directory.

---

## Project Structure

```
KarlCheckApp/
├── App.js                        # React Native entry point
├── assets/
│   ├── karlcheck.html            # The entire app UI (React + Babel, CDN)
│   └── project/
│       └── assets/
│           ├── sf-map-new.png    # Illustrated SF neighborhood map
│           ├── karlcheck-logo.png
│           └── fishermans-cam.png
├── public/                       # Built web output (gitignored ideally)
│   ├── index.html
│   └── project/assets/
├── metro.config.js               # Adds .html to Metro asset extensions
├── netlify.toml                  # Netlify static deploy config
├── app.json                      # Expo config
└── package.json
```

---

## Karl's personality

Karl speaks in first person throughout the app. His blurbs per neighborhood capture his mood:

> *"I never left. Bring a hood."* — Sunset  
> *"The one true sunny. I dare not enter."* — The Mission  
> *"Hold your hat. I'm doing 28 and accelerating."* — Twin Peaks
