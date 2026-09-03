---
name: sync-up
description: Use when the user says "sync up" or "catch me up" at session start — restores project context from docs/DECISIONS.md, BACKLOG.md, ARCHITECTURE.md, pending plans, git status and every local branch, then prints the Sync Up table and backlog frontier.
---

# Sync Up

On "sync up" or "catch me up":

1. Read `docs/DECISIONS.md`, `docs/BACKLOG.md`, `docs/ARCHITECTURE.md`
   - A backlog/decision item's status comes **solely** from its heading marker (`~~…~~` strikethrough + `DONE`/`SUPERSEDED`/`OBSOLETE`/`CLOSED`). Never infer status from body prose — a completed item may still carry its full original problem write-up below a struck-through heading, which reads as unresolved.
2. Check for pending plans — list `docs/superpowers/plans/` and read the most recent file. If a plan exists that hasn't been fully implemented, surface it in the summary.
3. Check git status and recent git log — use **separate parallel Bash calls** (not chained with `&&`), so each matches `Bash(git status*)` / `Bash(git log*)` allow rules and avoids permission prompts
4. **Scan local branches for in-progress work** — run `git branch` and for each non-main branch, run `git log main..<branch> --oneline` to see what's on it. Cross-reference branches with plan files (branch names often match plan topics). Report each branch with a short summary of its status:
   - How many commits ahead of main
   - Whether it's pushed to remote (`git branch -vv` shows tracking info)
   - Whether it corresponds to a known plan file
   - This catches work done by parallel agents in worktrees, which is otherwise invisible from main
5. Present the summary as a structured table, not prose paragraphs:

```
## Sync Up

| Area | Status |
|------|--------|
| **Branch** | `main` — clean / 2 uncommitted files |
| **Last commit** | `abc1234` — Short commit message |
| **Last decision** | #N — Summary of decision |
| **Pending plan** | None / `2026-03-12-badge-redesign.md` — Brief summary |
| **Blockers** | None / description |
| **Active branches** | None |

### Backlog frontier

| Workstream | Do now | Goal waits on | Parked |
|------------|--------|---------------|--------|
| **X launch** | ▶ Re-check posts · 👤 Demo assets | 👤 rename (untracked) | 1 |
| **SEO/GEO** | ✎ Platform brainstorm | content platform | 1 |

`▶` ready · `👤` founder · `✎` needs planning · `⏲` date-gated — say "expand <workstream>" for detail.

Ready to go — what are we working on?
```

**Frontier rendering rules** (one row per registry workstream — the table's
height is fixed by the registry, not by backlog size):

- **Do now** — the actionable items (`▶` ready · `👤` founder/operator-gated ·
  `✎` needs planning, where running the brainstorm *is* the do-now action).
  Cap at 3 titles + `+N more ready`; never let a cell sprawl.
- **Goal waits on** — the workstream's terminal gate, read from `**Blocked
  by:**` fields and external gates (`⏲` for date/trigger/deadline gates,
  including legal or review clocks). When a workstream has an in-flight plan,
  its phase/status tracker is the spine: read the gate from the plan, don't
  duplicate it into BACKLOG.
- **Parked** — count of items not shown (roadmap `…`, deferred, blocked behind
  the gate). Non-item content (hardening tables, checklists, runbook indexes)
  surfaces as a pointer + open-row count, never converted into items.
- **Compress, never delete** — everything squeezed out of the table is one
  "expand <workstream>" away: a compact per-item table (Item / Status / Waits
  on / Prio) followed by a short detail block per item with source + substance.
- **Active Branches** gets its own table (Branch / Commits / Remote / Plan)
  only when non-main branches exist; otherwise it collapses into the top
  table's `Active branches` row.

6. State readiness
