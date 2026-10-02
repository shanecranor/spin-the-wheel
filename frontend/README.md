# Song wheels

Four independent wheels for the root note, scale, instrument, and tempo of a song.
Spin a wheel or all unlocked wheels, lock results you want to keep, and copy
the combined result (for example, `C major · Guitar · 105 BPM`). Settings
control the available choices and tempo range. Settings, results, and locks
are saved in this browser.

## Practice timers

Below the wheels, set independent timers for learning the scale (5–20 minutes),
writing riffs (20–60 minutes), and recording a video (10–60 minutes). Each supports
start, pause/resume, reset, and restart. Duration changes are available before
starting or after finishing; reset a running or paused timer to change its duration.

When a timer finishes, it generates a new 10-second arpeggiated chiptune using the
current settled root note, scale, and BPM. Missing or still-spinning wheel values
are randomized from your settings. Alarms that finish together play in sequence.
Use **Test alarm** to preview the sound and **Stop sound** to silence it.

Starting a timer enables browser audio. Keep the page open and your device awake
for alarms; browser or operating system suspension can delay playback until the
page resumes. Timers use elapsed time rather than counting interval callbacks,
so they catch up when the page becomes active. Timers reset on page reload.

## Development

From this directory, install the versions in `yarn.lock` and start Vite:

```sh
yarn install --immutable
yarn dev
```

The app runs entirely in the browser and needs no backend or account.

```sh
yarn build
```

The state and selection tests use the built-in Node test runner and TypeScript
support (Node 22.18 or newer):

```sh
node --test tests/*.test.ts
```
