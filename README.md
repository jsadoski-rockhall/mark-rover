# Mark Rover

Mark Rover is a local markdown reader focused on fast file opening, safe rendering, and comfortable long-form reading.

## Run

```sh
pnpm install
pnpm dev -- tests/corpus/smoke.md
```

## Verify

```sh
pnpm check
pnpm test
pnpm test:electron
```

## Package

```sh
pnpm package:mac
```

## Notes

- `tests/corpus/` contains markdown documents used to test rendering, security, performance, and reader ergonomics.
- `.prototype/` is intentionally ignored. It contains historical Prototype Candidates and can be deleted when no longer needed.
- The app is written in TypeScript and uses Electron, Svelte, Tailwind, `markdown-it`, `sanitize-html`, Mermaid lazy rendering, and an optional Pretext typography probe.
- Type-checking spans three projects: `tsconfig.json` (Svelte renderer, via `svelte-check`), `tsconfig.node.json` (main process, worker, preload, build scripts), and `tsconfig.test.json` (Playwright smoke tests). Run them all with `pnpm typecheck`.
- Scripts and tests run directly as `.ts` via Node's native type stripping (Node 24+); no separate transpile step is needed for them.
