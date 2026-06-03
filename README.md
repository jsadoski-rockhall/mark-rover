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
- The app uses Electron, Svelte, Tailwind, `markdown-it`, `sanitize-html`, Mermaid lazy rendering, and an optional Pretext typography probe.
