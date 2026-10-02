# Repository notes

- `frontend/` uses React, Mantine, Vite, and Legend observables. avoid standard react state / refs whenever possible
- Wheel mechanics and controllers belong with wheel components; song choices and settings belong in the songwriting modules.
- Use Mantine's live reduced-motion hook. Keep settings UI, persistence, and spin lifecycle separate from page rendering.
- Keep the interface plain. Extract complex expressions into named helpers.
- Install from `frontend/yarn.lock` with `yarn install --immutable`. From `frontend/`, verify `yarn build`, focused ESLint checks, and `node --test tests/*.test.ts` (Node 22.18+).
