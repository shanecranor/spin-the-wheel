# Song wheels

Four independent wheels for the root note, scale, instrument, and tempo of a song.
Spin a wheel or all unlocked wheels, lock results you want to keep, and copy
the combined result (for example, `C major · Guitar · 105 BPM`). Settings
control the available choices and tempo range. Settings, results, and locks
are saved in this browser.

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
node --test tests/song-state.test.ts
```
