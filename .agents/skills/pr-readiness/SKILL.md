---
name: pr-readiness
description: >-
  Checks whether the current branch (or an open pull request) is ready to be
  reviewed and merged in podman-desktop, based on the reasons PRs were delayed
  or closed in the project history: scope, sign-off, failing checks, missing
  tests, screenshots, description, Svelte 5 and test conventions, extension API
  breakage, domain approvals and pending change requests. Invoke before opening
  a PR, before requesting a review, or when asked why a PR is not merged yet.
  Reports findings; does not push, comment or modify the PR.
---

# PR Readiness

Run a pre-review check on a branch or pull request and report what would most
likely cost a review round-trip. The checks are ordered by their observed cost
in the project history (study of ~2,000 human PRs, 2025-09 → 2026-09): scope
and approach first, then blocking process items, then conventions.

Every check maps to a section of [CONTRIBUTING.md](../../../CONTRIBUTING.md) or
[CODE-GUIDELINES.md](../../../CODE-GUIDELINES.md); cite the section in the report.

## Prerequisites

- `git`, and `gh` authenticated (`gh auth status`) for the PR checks
- An `upstream` remote pointing to `podman-desktop/podman-desktop` (fallback: `origin`)

## Input

- Nothing: check the current branch (`HEAD`)
- A branch name: check that branch without checking it out (use it as `TARGET` below)
- A PR number or URL: check that PR (`gh pr checkout` is **not** needed; read it with `gh`)
- Optionally a base (parent branch of a stack, or the PR's `baseRefName`); defaults to `upstream/main`

## Workflow

### 1. Collect the change

```bash
git fetch upstream main
TARGET=${TARGET:-HEAD}
BASE_REF=${BASE_REF:-upstream/main}
git log --oneline "$BASE_REF..$TARGET"
```

**Stacked branches:** if `git log` lists commits that belong to another branch (for example a parent `feat/…/13-…` branch
for `feat/…/14-…`, check with `git branch --contains <sha>`), set `BASE_REF` to that parent branch and say so in the
report. Otherwise the whole stack is reported as one oversized PR.

```bash
BASE=$(git merge-base "$TARGET" "$BASE_REF")
git diff --stat "$BASE" "$TARGET" -- . ':!pnpm-lock.yaml' ':!**/__snapshots__/**'
git diff -M --name-status "$BASE" "$TARGET"
git log --format='%h %ae %s | %(trailers:key=Signed-off-by,valueonly,separator=; )' "$BASE..$TARGET"
```

When checking `HEAD`, verify with `git branch --show-current` that the expected branch is checked out, and warn if the
working tree is dirty (uncommitted changes are not part of the PR).

Find the PR for the branch, and open PRs overlapping the same files:

```bash
gh pr list --repo podman-desktop/podman-desktop --head <branch> --state open --json number,title,baseRefName
gh pr list --repo podman-desktop/podman-desktop --state open --search "<distinctive file or feature name>" --json number,title,author
```

For a PR, also:

```bash
gh pr view <n> --repo podman-desktop/podman-desktop \
  --json title,body,isDraft,labels,reviewDecision,reviews,files,additions,deletions,statusCheckRollup,closingIssuesReferences
gh pr checks <n> --repo podman-desktop/podman-desktop
```

When there is no PR, mark the PR-only items of sections 3 and 4 as `N/A (no PR)`.

### 2. Scope and approach (CONTRIBUTING › One goal per PR, Before you start coding)

- Size excluding lockfile and snapshots. Flag > 200 lines (change requests go from 5% under 50 lines to ~25% above 200) and > 500 lines (suggest a split).
- Group changed files by area: `packages/extension-api`, `packages/main`, `packages/preload*`, `packages/renderer`, `packages/ui`, `extensions/*`, `tests/playwright`, `website`, `.github`. Flag a PR mixing extension API or main-process changes with renderer changes, a dependency bump with code, or a refactoring with a behaviour change.
- Flag unrelated drive-by edits: formatting-only hunks, reordering, renames outside the feature, file moves that are not pure renames (`git diff -M --name-status` shows `R100`).
- For a new service, API, page or data model, check that the linked issue contains an agreed approach. If there is no linked issue, flag it.
- Flag open PRs from other authors overlapping the same feature or files (duplicated or conflicting work).

### 3. Blocking items (CONTRIBUTING › Before requesting a review, Review process)

- Every commit has a `Signed-off-by` trailer matching the author.
- Commit messages and PR title follow `<type>(<scope>): <description>` with a type from CONTRIBUTING.
- For a PR: all checks green. List failing ones (`codecov/patch`, unit tests per OS, `argos`, Semantic PR…) and say whether each failure looks related to the diff.
- For a PR: any review whose latest state is `CHANGES_REQUESTED` blocks the merge — list the reviewer and whether their comments were answered, and suggest re-requesting a review.
- For a PR: list `domain/*/inreview` labels still pending (each needs an approval from that domain).
- For a PR: unresolved review threads, including automated review comments (CodeRabbit) not answered.

### 4. Description (CONTRIBUTING › Process)

- All template headings present and filled (`N/A` accepted).
- "What does this PR do" explains the why (root cause for a `fix:`).
- Visual change (`.svelte`, `packages/ui`, CSS/Tailwind) → before/after screenshots or "No visual change". New/changed `packages/ui` component → Storybook story updated.
- "How to test" has concrete steps and the environment they need; tested OS stated.
- Linked issue (`Closes #…`); dependent PRs linked and in draft.

### 5. Tests (CODE-GUIDELINES › Unit tests code)

- Each changed source file with logic has a changed or existing `*.spec.ts` next to it; flag new logic without tests.
- In added lines: `vi.mock('…')` string form (use `vi.mock(import('…'))`), a hand-written `const fooMock = vi.fn()` where `vi.mocked(foo)` works, `await tick()` where `waitFor` is expected, missing `vi.resetAllMocks()` in the top-level `beforeEach`.
- Labels or behaviour changed in UI covered by `tests/playwright` page objects → flag if the E2E code was not updated.

### 6. Code conventions (CODE-GUIDELINES)

Only inspect **added** lines (`git diff -U0 "$BASE" "$TARGET"`):

- Svelte: `on:click`/`on:*` directives, `$:` statements, new `writable(` stores, `$effect` that only assigns a `$state` (use `$derived`).
- New files: Apache copyright header with the current year, kebab-case `.ts` file names, `/@/` alias instead of `../` imports.
- `packages/main`: loose exported functions or statics in a service, `@inject` outside the constructor, listeners registered without being disposed.
- `packages/renderer`: direct reads of main-process data (configuration files, `product.json`) instead of a method exposed through the preload.
- `packages/extension-api`: removed/renamed members or tightened types (breaking change), new positional parameters instead of an options object, API change mixed with its implementation.
- Errors swallowed in `catch` blocks, functions returning `null` on error.
- Duplicated helpers: search the codebase for similarly named functions/components before accepting a new one.
- Website or app content promoting a vendor or linking to commercial offerings (vendor neutrality).

### 7. Run the fast local checks on touched files

Only when the target branch is checked out and `node_modules` exists:

```bash
npx eslint <changed files>
npx vitest run <changed spec files>
pnpm --filter <touched package> typecheck   # if types or APIs changed
```

Report only lint findings on lines added by the change (cross-check with `git diff -U0`); pre-existing warnings are
not part of the PR. Do not run `pnpm lint-staged` or any formatter with `--write` without the user's consent: they
modify files.

## Output

```markdown
## PR readiness — <branch or #PR>

**Verdict:** ready | ready with nits | not ready

### Blocking

- [ ] <finding> — <file:line or check name> — <CONTRIBUTING/CODE-GUIDELINES section>

### Likely review comments

- [ ] ...

### Nits

- [ ] ...

### Suggested split (if any)

1. <PR 1: scope>
2. <PR 2: scope, based on 1>
```

Report only what you verified. Do not push, comment on the PR, add labels or
request reviews unless the user explicitly asks.
