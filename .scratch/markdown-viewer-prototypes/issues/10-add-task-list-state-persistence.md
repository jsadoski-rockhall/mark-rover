# Add Task List State Persistence

Status: ready-for-agent

## Goal

Persist checkbox state locally without pretending markdown source mutation is solved.

## Tasks

- Generate stable checkbox identities from document path plus source-position or content-adjacent data.
- Store checkbox overrides in local storage.
- Apply persisted state after render.
- Test persistence across reloads and document reopen.
- Record known failure modes when nearby markdown edits change identity.

## Acceptance Criteria

- Checking a task list item persists across app reloads for the same document.
- Checkbox state is scoped per document.
- The implementation does not mutate the markdown file.

## Comments

- 2026-06-01: Created `.prototype/10` by copying forward successful prototype 09. Added renderer-side task list enhancement that enables sanitized checkbox inputs, keys state by document path + task index + label text hash, and stores overrides in local storage without mutating markdown. This is intentionally brittle around nearby task edits and documented as such. Pending install/check/test/bench verification.
- 2026-06-01: `pnpm check` and `pnpm test` passed. One-iteration benchmark on `corpus/task-list.md` emitted `first_viewport_ready` around 237 ms. Prototype 10 is successful.
