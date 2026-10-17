# Wild Putt

A cheerful mini golf web app for the whole family. Includes 15 single-hole courses, dinosaur and building-brick worlds, Halloween, Six Seven, touch pull-back shooting, sound effects, favorites, and friendly scoring.

## Run

Requires Node.js 22 or newer.

```sh
npm ci --cache /tmp/wild-putt-npm
npm start
```

The server listens on all interfaces, port 3000 (`PORT` overrides it). No credentials or database are needed. Use the existing checkout; each cloud task already has an isolated environment.

## Play

Pick a course, enter a name, and choose 1–4 players for shared-device play. Touch or click near your ball, drag away from the target, then release. A longer pull makes a stronger shot. Players alternate shots; the lowest score wins. There is no stroke limit or time pressure. “Unstick my ball” returns a local player to the tee without a penalty.

For separate devices, create a live room and have friends open the same deployed app and join with its six-character code. Up to four people play in turns with synchronized shots and scores. The host starts when everyone has joined. Rooms live in server memory and end when everyone leaves; refresh does not reconnect an existing player. Keep one server instance for a shared room.

## Install on a phone

Serve over HTTPS for installation and offline support. On iPhone, use Safari’s Share → Add to Home Screen. On Android, use the browser’s Install app / Add to Home screen action. After an initial online visit, cached shared-device play works offline. Live rooms require a connection to the Node server. This is a progressive web app; app store packaging and public hosting are separate deployment steps.

## Verify

```sh
npm run check
npm test
npm run test:e2e
```

Browser tests use the environment’s `/usr/bin/chromium`. Set `CHROMIUM_PATH` for another installed Chromium browser. Playwright starts a server automatically if one is not already running. Tests cover browsing, favorites, filtering, shared-device turns, phone touch input, live room synchronization, sinking a putt, course progression, and cached offline startup.

Fonts are bundled locally under `public/fonts`, with their SIL Open Font licenses. Course illustrations are original inline SVG. No external API or analytics is used.
