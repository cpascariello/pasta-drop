# Working Habits

Persistent habits for maintaining project memory across sessions.

---

## Quick Start

**Sync up:** Say "sync up" or "catch me up" to restore context at session start.

---

## Three Habits

### 1. Decision Logging

Log decisions to `docs/DECISIONS.md` when these phrases appear:
- "decided" / "let's go with" / "rejected"
- "choosing X because" / "not doing X because"
- "actually, let's" / "changed my mind"

Before proposing anything, check if it contradicts a past decision. If conflict found:
> This would contradict Decision #N (summary). Override?

**Format:**
```
## Decision #[N] - [Date]
**Context:** [What we were working on]
**Decision:** [What was decided]
**Rationale:** [Why - this is the important part]
**Alternatives considered:** [If any were discussed]
```

### 2. Scope Drift Detection

**This is an active interrupt, not a passive log.**

When the conversation drifts from the stated task:
1. Stop and say: "This is drifting from [original task]. Add to backlog and refocus, or pivot?"
2. If backlog: log to `docs/BACKLOG.md` and return to the original task
3. If pivot: continue, but note the scope change

**Triggers to watch for:**
- "Would it be useful to add X?" (when X wasn't part of original request)
- "We could also do Y" (when Y is unrelated to core ask)
- "While we're at it, let's add Z"
- Any work that extends beyond what was asked

**Do NOT flag** clarifying questions about the core feature or technical approaches to achieve the original goal.

**Backlog format:**
```
### [Date] - [Short title]
**Source:** Identified while working on [context]
**Description:** [What needs to be done]
**Priority:** Low/Medium/High
```

### 3. Git Discipline

**Branching:**
- Brainstorm and plan on main
- When dev starts, create feature branch from main before any file edits
- Branch naming: `feature/[plan-name]`

**During development:** Track intent, not metrics.

- **Scope drift:** "This started as [X] but now includes [Y]. Commit [X] first?"
- **Feature complete:** When user says "done" or "that's it" → squash merge to main
- **Pre-break:** When user says "break", "later", "tomorrow" → "Push before you go?"

**Completion:** Squash merge keeps main history clean (one commit per feature).

Never interrupt based on file count or commit count.

---

## Context Recovery

On "sync up" or "catch me up":

1. Read `docs/DECISIONS.md`, `docs/BACKLOG.md`, `docs/ARCHITECTURE.md`
2. Check git status (branch, uncommitted changes, unpushed commits)
3. Check recent git log for context
4. Summarize:
   - Last decision logged
   - Open backlog items
   - Any blockers
   - Git status
5. State readiness

---

## Docs

| File | Purpose |
|------|---------|
| `docs/DECISIONS.md` | Decision log with rationale |
| `docs/BACKLOG.md` | Parking lot for scope creep and deferred ideas |
| `docs/ARCHITECTURE.md` | Technical patterns and component structure |
| `docs/plans/` | Design and implementation plans (read-only reference) |

---

## Skill Integration

Skills (superpowers) are tools, not separate processes. Use them naturally:

- **Brainstorming:** Use for non-trivial design work. Flag scope creep during brainstorming.
- **Planning:** Use `writing-plans` or `EnterPlanMode` for multi-file changes, new features, unclear requirements.
- **Implementation:** Use `subagent-driven-development` or `executing-plans` for complex implementations.
- **Post-implementation:** Run build/lint verification, handle git workflow, update ARCHITECTURE.md if new patterns emerged.
- **Post-push:** Log any key decisions to DECISIONS.md.

---

<!-- PROJECT-SPECIFIC DOCUMENTATION BELOW -->

## Pasta Drop

Decentralized pastebin using Aleph Cloud for permanent storage.

### Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Key Files

| File | Purpose |
|------|---------|
| `src/components/Editor.tsx` | Paste creation UI with wallet connection |
| `src/components/Viewer.tsx` | Paste viewing UI with copy link |
| `src/components/FloatingEmojis.tsx` | Ambient floating spaghetti background |
| `src/components/CelebrationBurst.tsx` | One-shot emoji confetti on paste creation |
| `src/services/aleph-read.ts` | `fetchPaste()` — lightweight, no heavy deps |
| `src/services/aleph-write.ts` | `createPaste()` — Aleph SDK + ethers5 (Ethereum) |
| `src/services/aleph-write-sol.ts` | `createPasteSolana()` — Aleph SDK + AppKit Solana provider |
| `src/services/pasta-history.ts` | localStorage CRUD for per-wallet paste history |
| `src/services/explorer-meta.ts` | localStorage cache for Aleph Explorer link metadata |
| `src/components/PastaHistory.tsx` | My Pasta history list component |
| `src/config/appkit.ts` | Reown AppKit config (unified Ethereum + Solana modal) |
| `src/config/aleph.ts` | Aleph constants |
| `src/config/floatingEmojis.ts` | Floating emoji tuning (counts, opacity, sizes, speed) |
| `src/config/celebration.ts` | Celebration burst tuning (emojis, count, spread, duration) |

### URL Structure

- `https://app.example.com/` → Editor view
- `https://app.example.com/#<hash>` → Viewer showing paste at hash
- `https://app.example.com/#my-pasta` → Per-wallet paste history

### Branding

See `docs/plans/BRANDING.md` for full microcopy guide. Key terms:
- "Al dente" = Create/Submit
- "Share your bolo" = Copy link
- "Pasta Served" = View header
- "A tavola!" = Success
- "Drop another" = New paste

### Before Deploying

1. Get WalletConnect project ID from [cloud.reown.com](https://cloud.reown.com)
2. Set `VITE_WALLETCONNECT_PROJECT_ID` in `.env`
3. Deploy to any static host (Vercel, Netlify, GitHub Pages)
