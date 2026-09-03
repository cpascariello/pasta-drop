---
paths:
  - "docs/superpowers/plans/**"
  - "docs/superpowers/waves/**"
---

# Plan files

## Plan Status Tracking

When an agent finishes executing a plan (all tasks complete, or stopped mid-way), it must add a status line to the **top** of the plan file:

```
---
status: done | in-progress | blocked
branch: feature/branch-name
date: 2026-03-31
note: awaiting testing / blocked on X / Task 3 deferred to BACKLOG
---
```

This makes plan status visible during sync-up without needing to inspect branches. The branch scan (`sync-up` skill, step 4) cross-references these annotations to give a complete picture.

The `note:` field captures execution-time context, not post-merge bookkeeping. Once `status: done` is set and the branch is squash-merged, the PR/SHA pairing is recoverable via `git log --grep` / `gh pr list` — duplicating it in the plan frontmatter creates a post-merge dirty bit that can't be pushed (main is hooked closed). For wave manifests (`docs/superpowers/waves/<wave-id>.md`), the per-row PR/SHA tracking *is* the audit artifact and lands cleanly through chore PRs.

## Plans Must Include Verification and Doc Updates

Every implementation plan must include verification and doc update tasks at the end. This is not optional — it's part of the definition of done, not a merge-time afterthought.

The final two plan tasks should be:

```
### Task N-1: Verify and refine

- [ ] Run full project checks (lint, typecheck, test)
- [ ] Manual testing / smoke test the feature
- [ ] Fix any issues found
- [ ] Re-run checks until clean

### Task N: Update docs

- [ ] ARCHITECTURE.md — new patterns, new files, or changed structure
- [ ] DECISIONS.md — design decisions made during this feature
- [ ] BACKLOG.md — completed items moved, deferred ideas added
- [ ] CLAUDE.md — capability index, only if a new capability shipped
```

Copy these tasks verbatim into every plan. Do not paraphrase or summarize — the explicit checklist prevents items from being forgotten.
