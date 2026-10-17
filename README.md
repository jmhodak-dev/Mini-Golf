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

## Animated 3D worlds (version 2)

The playable courses now use a locally bundled Three.js WebGL renderer with an orthographic toy-world camera, soft shadows, modeled characters, moving scenery, waving flags, floating stars, weather particles, shot trails, and celebration bursts. Every world has its own scenery and animation: dinosaurs, a working brick crane, friendly ghosts, dancing six/seven characters, a rocking pirate ship, candy windmills, an erupting volcano, orbiting planets and a rocket, a castle, a waving octopus and swimming fish, T. rex, a haunted house with bats, rainbow windmills, sliding penguins, and a trophy celebration.

Each course has three optional stars to collect, a moving bumper and a yellow boost pad. Purple/teal portals appear in Space Cadet, Ghost Town, and The Grand Finale. Stars are a bonus; finishing the hole never requires collecting them all. Live rooms share a shot phase so moving-obstacle collisions use the same fixed-step simulation on every device. Collected stars synchronize at the end of a shot.

A browser with WebGL 2 is required. The renderer caps pixel density for phone performance, reuses one graphics context, and disposes old scene resources when changing courses. Reduced-motion preferences stop decorative motion while keeping essential gameplay active.

To rebuild the vendored engine and the single-file download after editing:

```sh
npm ci --cache /tmp/wild-putt-npm
npm run build
```

The new standalone game is `downloads/Wild-Putt.html`. It embeds its graphics engine, fonts, styles and code; shared-device play works without a server. Live rooms require the hosted application. The prebuilt engine is committed, so production hosting can run `npm ci --omit=dev` then `npm start` without a build toolchain.

### Little Golfer mode

Little Golfer is the default. It offers a larger cup and gently guides slow near misses into the hole when the path is clear. There are no penalties or stroke limits. Wide arched bridges provide a route over obstacles, and several worlds have roomy tunnels and slow rotating sweepers. Optional stars and shortcuts add challenge without blocking progress. Choose Classic in the start dialog for a smaller cup and no near-cup help. A live room uses its host’s mode.

## Host on your own PC

Install Node.js LTS (22 or newer), extract the source archive, and double-click `start-windows.cmd` on Windows. On macOS, run `bash start-mac.sh` in the extracted directory. The launcher installs production dependencies, starts the game, and prints the Wi-Fi/Ethernet address to open on phones connected to the same home network. Keep the PC awake and the terminal open. If Windows Firewall prompts, allow Node.js on the private/home network. No router port forwarding is needed for home play.

The underlying command is `npm run host`. LAN browser play and live rooms work over the home-network HTTP address. HTTPS hosting is needed for installable/offline phone app features. See `PLAY-ON-YOUR-PC.txt` for family setup instructions.
