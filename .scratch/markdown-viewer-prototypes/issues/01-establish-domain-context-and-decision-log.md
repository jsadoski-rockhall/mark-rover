# Establish Domain Context and Decision Log

Status: completed

## Goal

Create only the documentation scaffolding needed to keep product language and architectural decisions coherent as prototypes accumulate.

## Background

This repo uses a single-context domain docs layout. `CONTEXT.md` should be a glossary only, not a spec. ADRs should be created sparingly when a decision is hard to reverse, surprising without context, and trade-off driven.

## Tasks

- Add `CONTEXT.md` only if there are resolved product terms worth defining.
- Consider glossary terms such as `Document`, `First Viewport Ready`, `Trusted Local Content`, `External Link`, `Prototype Candidate`, and `Corpus`.
- Do not include implementation details in `CONTEXT.md`.
- Create `docs/adr/` only when the first accepted ADR is needed.
- Evaluate the ADR candidates listed in the PRD after the first implementation pass has real trade-offs.

## Acceptance Criteria

- Product terminology used by issues and implementation is either defined in `CONTEXT.md` or intentionally left as ordinary language.
- No ADR exists merely to record an obvious or reversible choice.
- Any created ADR uses the compact format from `/Users/joesadoski/.agents/skills/grill-with-docs/ADR-FORMAT.md`.

## Comments

- 2026-06-01: Created `.prototype/01` as a context package with a small `pnpm check` script. Added root `CONTEXT.md` terms for Document, Prototype Candidate, Corpus, First Viewport Ready, and External Link. Deferred ADRs because no implementation trade-off has matured enough yet.
- 2026-06-09: Verified in the consolidated app and marked completed. Root `CONTEXT.md` exists with the glossary terms (Document, Prototype Candidate, Corpus, First Viewport Ready, External Link) and no implementation details. `docs/adr/` intentionally absent, consistent with the acceptance criterion that no ADR exist merely to record an obvious or reversible choice.
