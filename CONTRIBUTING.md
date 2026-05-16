# Contributing to ZerithDB

Thank you for your interest in ZerithDB! Every contribution — code, docs, tests, bug reports —
matters enormously.

---

## Code of Conduct

ZerithDB follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/). Be kind and
constructive. Violations → `conduct@zerithdb.dev`

---

## Project Philosophy

1. **Developer experience above all.** If the API feels awkward, it's a bug.
2. **Simple defaults, powerful escapes.** Zero config covers 80%. The other 20% must be possible.
3. **Local-first is a feature.** Offline support is not an afterthought.
4. **Privacy by architecture.** We cannot see user data — by design, not policy.
5. **Monorepo discipline.** Each package must be independently usable. No circular dependencies.

---

## Development Setup

### Prerequisites

| Tool    | Min Version | Install                            |
| ------- | ----------- | ---------------------------------- |
| Node.js | 20.x        | [nodejs.org](https://nodejs.org)   |
| pnpm    | 9.x         | `npm i -g pnpm`                    |
| Git     | 2.x         | [git-scm.com](https://git-scm.com) |

### Bootstrap

```bash
git clone https://github.com/YOUR_USERNAME/ZerithDB.git
cd ZerithDB
git remote add upstream https://github.com/Zerith-Labs/ZerithDB.git
pnpm install
pnpm build
pnpm test          # verify environment
pnpm dev           # start all packages in watch mode
```

### Working on a Single Package

```bash
pnpm --filter zerithdb-db dev
pnpm --filter zerithdb-sync test
pnpm --filter zerithdb-sdk dev
```

---

## Contribution Workflow

### 1. Find or Create an Issue

- Browse
  [`good-first-issue`](https://github.com/Zerith-Labs/ZerithDB/issues?q=label%3Agood-first-issue) or
  [`help-wanted`](https://github.com/Zerith-Labs/ZerithDB/issues?q=label%3Ahelp-wanted).
- For features, open a Discussion before writing code.
- Comment `/assign` to automatically claim an issue. Use `/unassign` if you can no longer work on
  it.

### 2. Branch Naming

```bash
git checkout -b feat/react-hooks         # new feature
git checkout -b fix/issue-42-db-crash    # bug fix
git checkout -b docs/sync-api-reference  # documentation
git checkout -b chore/update-yjs         # maintenance
```

### 3. Commit Convention (Conventional Commits)

```
<type>(<scope>): <short description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`  
Scopes: `db`, `sync`, `network`, `auth`, `sdk`, `cli`, `core`, `infra`

```bash
git commit -m "feat(db): add reactive live query support"
git commit -m "fix(sync): resolve race condition in CRDT merge"
```

---

## Coding Guidelines

### TypeScript (Strict)

- `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` — no exceptions.
- Explicit return types on all exported functions.
- No `any`. Use `unknown` and narrow appropriately.
- No non-null assertions (`!`) without an explanatory comment.
- No `ts-ignore` without a linked GitHub issue.

### Error Handling

```typescript
import { ZerithDBError, ErrorCode } from "zerithdb-core";
throw new ZerithDBError(ErrorCode.DB_WRITE_FAILED, `Failed to write to "${collection}"`, {
  cause: err,
});
```

### Exports

Each package exports only its public API from `src/index.ts`. Internal code lives in `src/internal/`
and is never exported.

---

## Testing Strategy

| Layer       | Tool       | Location                    |
| ----------- | ---------- | --------------------------- |
| Unit        | Vitest     | `packages/*/src/__tests__/` |
| Integration | Vitest     | `tests/integration/`        |
| E2E         | Playwright | `tests/e2e/`                |

```bash
pnpm test                    # all tests
pnpm test --coverage         # with coverage
pnpm test:e2e                # Playwright
pnpm --filter zerithdb-db test --watch
```

**Rules:**

- Every bug fix must include a regression test.
- Every new public API must have unit tests.
- Test behavior, not implementation. Avoid mocking internal ZerithDB code.

---

## Issue Labels

| Label              | Meaning                                          |
| ------------------ | ------------------------------------------------ |
| `good-first-issue` | Welcoming to newcomers — scoped and well-defined |
| `help-wanted`      | Core team needs community bandwidth              |
| `high-impact`      | Critical path for v1.0                           |
| `core`             | Changes to architecture or `zerithdb-core`       |
| `bug`              | Confirmed bug with reproduction steps            |
| `enhancement`      | New feature or improvement                       |
| `docs`             | Documentation only                               |
| `performance`      | Performance regression or improvement            |
| `breaking-change`  | Requires a major version bump                    |

---

## Pull Request Checklist

- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` shows no errors
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] New/changed public APIs have TSDoc comments
- [ ] Changeset added (`pnpm changeset`) if a published package changed
- [ ] PR description explains **what**, **why**, and **how**

---

## Release Process

ZerithDB uses [Changesets](https://github.com/changesets/changesets).

When your PR changes a published package:

```bash
pnpm changeset
# Select affected packages, choose bump type, write change summary
# Commit the generated .changeset/*.md file with your PR
```

Maintainers handle the actual npm publish via the automated Release PR workflow.

---

## Getting Help

| Where                                                                     | When                          |
| ------------------------------------------------------------------------- | ----------------------------- |
| [GitHub Issues](https://github.com/Zerith-Labs/ZerithDB/issues)           | Bug reports, feature requests |
| [GitHub Discussions](https://github.com/Zerith-Labs/ZerithDB/discussions) | Ideas, questions              |
| [Discord `#contributors`](https://discord.gg/MhvuDvzWfF)                  | Real-time help                |

---

_Every line you write, every test you add, every doc you improve — it matters._
