# Issue tracker: GitHub Issues

Active issues for this repo live in **GitHub Issues** on
`jsadoski-rockhall/mark-rover`, managed with the `gh` CLI.

## Conventions

- Create issues with `gh issue create`; read them with `gh issue view <n>` and
  `gh issue list`.
- Triage state is expressed with **labels**, not a `Status:` line. See
  `triage-labels.md` for the canonical label vocabulary; the labels exist on the
  GitHub repo.
- Use `bug` / `enhancement` (GitHub defaults) to mark the issue type.
- Cross-reference related issues with `#<number>` so GitHub links them.
- Conversation history is GitHub comments (`gh issue comment <n>`).
- Close with `gh issue close <n>` (optionally `--reason completed|not planned`).

## PRDs

Long-form PRDs remain local markdown at `.scratch/<feature-slug>/PRD.md`. Link
the relevant GitHub issues from the PRD by number/URL.

## Historical archive

Pre-migration work was tracked as local markdown under
`.scratch/<feature-slug>/issues/<NN>-<slug>.md`. Those files are a **frozen
archive** of completed work (e.g. `markdown-viewer-prototypes/issues/01`–`24`)
and are kept for history. Do not add new issues there — new issues go to GitHub.

## When a skill says "publish to the issue tracker"

Create a GitHub issue with `gh issue create`, applying the appropriate triage
and type labels.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number>` (the user will normally pass the number or URL). If
the reference points at a `.scratch/.../issues/NN` path, it's an archived
pre-migration issue — read the file directly.
