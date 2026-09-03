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
2. If backlog: log to `docs/BACKLOG.md` (default to **Needs planning**; use **Ready to execute** only if scope is fully clear and the work fits a single sitting) and return to the original task
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
**Workstream:** [name from the registry at the top of BACKLOG.md]
**Blocked by:** [other entry titles, or external gates like "[FOUNDER] rename" / "vendor release" — omit the line if none]
**Source:** Identified while working on [context]
**Description:** [What needs to be done]
**Priority:** Low/Medium/High
```

Keep `**Blocked by:**` current: when a gate resolves, clear the field on every
entry naming it — never record a gate's resolution only as an update note
inside a body (sync-up can't see it there).

### 3. Git Discipline

**Branching:**
- Brainstorm and plan on main
- **Push main before branching** — unpushed commits on main cause divergence after squash merge
- When dev starts, create feature branch from main before any file edits
- Branch naming: `<type>/[name]` (e.g. `feature/`, `fix/`, `chore/`, `refactor/`)

**Before merging:** Update ALL docs before squash merging to main.
- `docs/ARCHITECTURE.md` -- add/update patterns for any new architectural decisions, new files, or changed structure
- `CLAUDE.md` -- add a line to the capability index **only if a new capability shipped** (feature detail belongs in ARCHITECTURE.md, not here)
- `docs/DECISIONS.md` -- log any key decisions made during the feature
- `docs/BACKLOG.md` -- move completed items to Completed section (**close-out rule:** extract any open follow-ups from the item's body or results files into their own live entries first — a DONE heading buries everything under it), add any deferred ideas (sorted into Ready to execute / Needs planning / Roadmap ideations)

**Checklist before merge:**
1. ARCHITECTURE.md updated?
2. CLAUDE.md capability index updated (only if a new capability shipped)?
3. DECISIONS.md has implementation decisions?
4. BACKLOG.md item moved to Completed?
5. Plan file status updated? (if a plan file exists for this branch)

**During development:** Track intent, not metrics.

- **Scope drift:** "This started as [X] but now includes [Y]. Commit [X] first?"
- **Implementation complete:** When coding tasks are done -> "Ready to verify and refine, or still working?"
- **Feature complete:** When user says "done" or "that's it" -> squash merge to main
- **Pre-break:** When user says "break", "later", "tomorrow" -> "Push before you go?"

**Completion:** `gh pr merge --squash` keeps main history clean (one commit per feature). Never push directly to main — always go through a PR.

Never interrupt based on file count or commit count.

**Finishing a branch** (overrides the `finishing-a-development-branch` skill options):

**Use `/dio:ship`.** The skill runs the full sequence end-to-end — catch up on main, doc audit against the actual `git diff main...HEAD`, project checks, commit, push, PR, squash-merge, local cleanup — without intermediate confirmation prompts. The steps live in the skill; this section only holds the rules below and any project-specific overrides. If the user says "ship", "ship this", "merge this", or "wrap it up", invoke `/dio:ship` rather than running the steps manually one at a time.

**Never merge locally.** Option 1 ("Merge back to main locally") from the finishing skill is not allowed — hooks block direct pushes to main, and local merges cause SHA divergence after squash-merge. Always go through the PR.

**URL pushes name their source repo.** A global hook blocks `git push <URL>` unless the command uses `git -C <absolute-repo-path>` — a push to an explicit URL crosses repo/account boundaries, so the source must be named in the command, never inherited from the shell's cwd. (Origin incident: a failed `cd` in a compound didn't stop the chain — `set -e` is unreliable in the harness shell — and the push sent an entire private product repo to a foreign account's fixture repo.) Corollaries: never chain `cd` with a push; a hook-blocked command executed *nothing*, so re-verify every precondition before retrying; scripted pushes carry a precondition assert on the source itself (e.g. `git rev-list --count HEAD` and author match expectations).

**Project-specific overrides** to the ship sequence (e.g., "push schema to Neon before merging", "add a deploy reminder to BACKLOG.md after merge") belong in this section. The `/dio:ship` skill reads them and respects them.

---

## Context Recovery

On "sync up" or "catch me up", invoke the `sync-up` skill (`.claude/skills/sync-up/SKILL.md`). It reads the docs, scans branches and plan files, and prints the sync table plus the backlog frontier.

---

## Docs

| File | Purpose |
|------|---------|
| `docs/DECISIONS.md` | Decision log with rationale |
| `docs/BACKLOG.md` | Parking lot for scope creep and deferred ideas, triaged into Ready to execute / Needs planning / Roadmap ideations / Completed |
| `docs/ARCHITECTURE.md` | Technical patterns, component structure, and recipes |
| `docs/superpowers/specs/` | Design specs from brainstorming sessions (read-only reference) |
| `docs/superpowers/plans/` | Implementation plans from planning sessions (read-only reference) |

Auto memory handles informal operational learnings (build quirks, debugging tips, environment gotchas); `docs/` handles structured project knowledge. Don't duplicate between them.

**Template updates:** Run `/template-check` to see if the project template has changed since this repo was bootstrapped and get help adopting relevant changes.

---

## Skill Integration

Skills (superpowers) are tools, not separate processes. Match the ceremony to the size of the work — see Workflow Tiers below — and use skills naturally within it:

- **Brainstorming:** Use for non-trivial design work (Medium and Large tiers). Flag scope creep during brainstorming. **Probe for unknown unknowns before converging:** ask what could invalidate the design that nobody has named yet — unverified assumptions, vendor behavior never observed, integration seams never exercised — and convert each into a named, probe-able unknown with a verdict slot, so the answers arrive before implementation instead of during it. **Run brainstorms action-oriented:** don't ask permission to proceed step by step — explore the questions yourself (read code, run read-only probes), surface tradeoffs, and propose a recommendation per question; pause only on genuine forks where the user's preference is unknown. Boundary: a converged brainstorm still ends with an explicit "ready to go?" — exploration is free, but writes and implementation wait for an explicit go. **Name the workstream at classification time:** every brainstorm/feature/phase/wave is assigned to a workstream from the BACKLOG registry — or adds a new registry row with a named goal — before design work starts; specs and plans carry `workstream:` in their frontmatter so the backlog items they spawn inherit it.
- **Planning:** Use `writing-plans` for Large-tier work. A plan is a task breakdown — for edits to large existing files, "precise intent + the new code + which file to read" is the honest standard; don't force complete-code-per-step where it can't truthfully be pre-written.
- **Implementation:** Use `subagent-driven-development` or `executing-plans` for Large-tier plans; smaller tiers skip the plan file but still run the lead/adversary/fixer roles for any code change (see below).
- **Debugging state/sync bugs:** Before writing any fix, trace the full data flow (write -> store -> fetch -> parse -> render). Identify all integration points that need coordinated changes. Don't patch one step without understanding the chain.
- **Post-implementation:** Use `/dio:ship` to run the full finishing sequence (doc audit + checks + commit + push + PR + squash-merge + cleanup) end-to-end. The skill audits docs against the actual diff so they don't drift across feedback iterations.

### Lead / adversary / fixer

For **any code change** — every tier, every size — run three roles instead of one. Doc-only and copy-only diffs are exempt (they still get the ship-time doc audit). The lead (main session) never writes the code it reviews, and never reviews the code it writes.

- **Lead** — you. Owns the plan, dispatches, adjudicates findings, and holds the operator checkpoints. Never fixes a finding directly: hand it to the fixer with the reviewer's evidence attached, so the review record stays honest.
- **Adversary** — a reviewer dispatched per task, told to *attack* the diff. Give it: the task brief, the implementer's report, a self-contained diff package, the binding constraints copied verbatim, and 4-6 concrete adversarial questions ("can a message from an authorized sender for a *different* owner be accepted?"). Tell it explicitly not to trust the implementer's report — a stated rationale never downgrades a finding's severity.
- **Fixer** — applies findings. Every dispatch carries the reviewer's file:line evidence and the failing scenario, not a paraphrase. It re-runs the covering tests and reports the command + output.

**Spawn reviewers fresh per task.** A long-lived reviewer accumulates "I already checked something like this" and starts skimming. Fresh spawns cost tokens and buy independence. Dispatches must therefore be *self-contained* — write them so a reviewer with zero session history can work. That also means losing a teammate mid-review costs nothing.

**Adversarial review earns its cost only if it can falsify.** The reviews that paid for themselves checked findings against **production data and the vendor's own source**, not against the diff's claims. One review disproved two discriminators the code could plausibly have used, by pulling the real on-chain grants. Another caught that a fix's own doc comment asserted the opposite of what the backend actually did. Tell the reviewer to verify, not to read.

**Escalate the severity ladder honestly.** "Would block merge" is the bar for Important. When a finding is real but the fix is large and the feature is dark, say so: land the cheap guard, log a decision with the residual named, and file the real fix as a go-live gate. Don't let "dark" become a synonym for "never fixed".

**Known failure modes (all observed):**
- **Background teammates go idle without reporting.** Prevention first: every dispatch ends with "Send your report via SendMessage addressed to 'team-lead' (sending to 'main' bounces) BEFORE going idle" — the bounce is the most common cause, and dispatches that omit the line cost one ping round-trip per agent (6+ observed in a single SDD run). Recovery: ping once; or extract the report from the agent's transcript (`~/.claude/projects/<slug>/*.jsonl`, newest non-lead file); if neither lands, re-dispatch the review **synchronously** (`run_in_background: false`) — a synchronous agent returns its report as the tool result and cannot silently drop it. Prefer synchronous for anything whose output gates a decision.
- **Double-assignment corrupts a shared branch.** Never hand the same task to two agents. If it happens, the second agent should verify rather than race — a competing commit on a shared checkout is worse than a slow one.
- **Teammates share the working tree.** Parallel *writers* need worktrees; parallel *reviewers* are read-only and safe. Tell reviewers explicitly: read-only, do not mutate the working tree, index, HEAD, or branch state.
- **The lead's own "verified live" claims are the most dangerous input in the loop.** They get written into code comments and reviewers trust them. Name the execution context (which process, which host, which wallet) before asserting one, and prefer a channel-wide scan over the convenient fixture.
- **Idle teammates accumulate until they exhaust tmux panes.** When a task's cycle closes: persist what the teammate produced (report on disk, ledger line, a final SendMessage pull for anything only in its head), then shut it down immediately — never batch cleanup or keep teammates "just in case". Keep one alive only while a later step still needs its context: an implementer through its item's review/fix cycle, a reviewer through its re-review rounds; both end at squash-merge. (Origin: a 16-teammate idle pile-up plus two pane-exhaustion spawn failures, 2026-07-27/28.)

### Workflow Tiers

Match the ceremony to the work. When unsure, size up one tier, not down.

- **Small** — a bug fix, copy tweak, or contained change to one or two files with no design unknowns. Branch, do it, ship. No spec, no plan — but code changes still run the lead/adversary/fixer roles.
- **Medium** — a feature or refactor spanning a few files, with design choices but no deep unknowns. A short brainstorm if the design isn't obvious; a brief spec only when the *why* is worth preserving past the diff. Brainstorm → plan → implement in the **same session**.
- **Large** — architectural, security-sensitive, or multi-day cross-layer work. Full brainstorm + spec + plan. The spec is the highest-value artifact — it records the *why* the diff and commit log can't. A separate implementation session is **optional**.

### Session Workflow

Default: brainstorm, plan, and implement in **one session**. Context windows are large enough that brainstorm back-and-forth doesn't meaningfully crowd implementation.

Split into a separate implementation session only for Large-tier work whose implementation is a multi-day effort — when a clean execution context earns the handoff seam. When splitting:

1. **Brainstorm + Plan session:** Explore design, write the spec to `docs/superpowers/specs/` and the plan to `docs/superpowers/plans/`.
2. **Implement session:** Start fresh, say "sync up", then execute the plan via `executing-plans` or `subagent-driven-development`. The plan file on disk is the handoff artifact — no brainstorm context carries over.

### Plan files

Plan-file conventions — the status frontmatter every executed plan carries and the mandatory verification + doc-update tasks every plan ends with — live in `.claude/rules/plans.md`, which loads whenever a file under `docs/superpowers/plans/` or `docs/superpowers/waves/` is read or written.

### Verification Must Reach the Change

A check is only coverage if it exercised what you changed. Answer two questions
separately, and never let the second hide the first:

1. **Change coverage** — did anything exercise the behavior *this branch* shipped?
2. **Regression** — did this branch break something else?

Report change coverage **first**, and report it even when it's empty:

```
Change coverage: NONE — <what can't be reached> (<why>).
  Evidence instead: <unit test / component test / manual walk / direct probe>.
```

A verdict must name **the assertion that touches the change**, not just a test
or flow name. Otherwise any loosely-related green gets claimed as coverage and
the gap quietly reopens.

**An empty change coverage is a stop signal, not a field to fill in.** If your
verification can't reach what you changed, running an adjacent check and
reporting its green is worse than skipping it — the ✅ reads as "the change was
tested" when nothing tested it. Skip the ceremony, state plainly what *did*
verify the change, and file the gap if that surface deserves permanent
coverage. Run the adjacent check anyway only when the change plausibly
disturbed a surface it *does* cover, and say which surface and why.

---

## Project: Pasta Drop

Decentralized pastebin: paste text, sign with an Ethereum or Solana wallet, get a permanent Aleph Cloud link anyone can read without a wallet.

### Deployment

Static build (`dist/`) deployed by Stasho. `.github/workflows/stasho-deploy.yml` runs on every push to `main`: installs with `npm install --legacy-peer-deps`, pulls build env (including `VITE_WALLETCONNECT_PROJECT_ID`) from the Stasho backend, builds, uploads the tarball. Manual redeploy of a specific SHA via `workflow_dispatch`. An external GitHub app periodically re-adds `.github/workflows/aleph-deploy.yml` — remove it, don't investigate.

Locally, `VITE_WALLETCONNECT_PROJECT_ID` goes in `.env` (get one at [cloud.reown.com](https://cloud.reown.com)).

### Commands

Run `npm run lint && npm run build` before shipping (build runs `tsc -b` first, so it doubles as the typecheck). No test suite yet. Install with `npm install --legacy-peer-deps` (ethers v5/v6 peer-dep mismatch across the Aleph SDK / wagmi ecosystem).

Footer version lives in `src/App.tsx` (`v0.x.y`); bump it when shipping user-visible changes.

### Current Features & Architecture

Feature implementation details are **not inlined here** — they change every release and would tax
every turn. The detail lives in docs, read on demand:

- **`docs/ARCHITECTURE.md`** — what the app does now + how it's built (patterns, key files, recipes). The canonical "what is".
- **`docs/DECISIONS.md`** — the *why* behind each feature (numbered log; the index below cites `#N`).
- **`docs/BACKLOG.md`** — deferred work and roadmap.
- **`docs/plans/BRANDING.md`** — microcopy guide. Key terms: "Al dente" = create, "Mangia!" = copy link, "Pasta Served" = view header, "A tavola!" = success, "Drop another" = new paste. Pre-template design docs also live in `docs/plans/`.

**IMPORTANT:** Before changing behavior in any feature area, read its section in `docs/ARCHITECTURE.md`
(and the cited `docs/DECISIONS.md` entries) first. The index below is a map of *what exists* — not a
substitute for those docs.

#### Capability index

**Storage**
- Create paste as an Aleph STORE message, built manually and POSTed to `api2.aleph.im` (#1, #12, #13, #19)
- Ethereum write path with pre-flight ALEPH token balance check, mainnet only (#2, #5, #14)
- Solana write path via AppKit provider bridged to the Aleph SDK signer (#15, #18)
- Public reads from the Aleph gateway with no wallet and no heavy deps (#10)

**App**
- Hash routing: `/` editor, `#<hash>` viewer, `#my-pasta` per-wallet history (#3, #16)
- Unified Ethereum + Solana wallet modal via Reown AppKit (#18)
- Per-wallet paste history in localStorage, 50-entry cap (#16)
- Viewer hash links to Aleph Explorer when metadata is cached, gateway raw URL otherwise

**Look & feel**
- oklch theme, Erica One + Lato typography, Tailwind v4 `@theme` (#4, #6, #9)
- Floating spaghetti background with mouse/touch repulsion, 120s background hue cycle (#7, #8, #17)
- Card entrance, textarea focus, copy bounce, and celebration burst animations (#11)
