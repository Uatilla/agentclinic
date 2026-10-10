# OpenSpec guide

OpenSpec is an SDD tool: a CLI plus slash commands that the AI assistant runs. Specs are the
source of truth, and every change is agreed in files *before* code is written.
**Propose → apply → archive.**

> Written against OpenSpec 1.x (Oct 2026). Commands change between versions: check
> `openspec --version` and the docs (github.com/Fission-AI/OpenSpec) when something doesn't match.

🔗 = link to the SDD guide (`prompts.md`).

## Core idea
Two kinds of spec:
- **Main specs** (`openspec/specs/`): how the system behaves *now*, one folder per capability.
- **Changes** (`openspec/changes/<name>/`): a proposed change, written as **deltas** against the
  main specs (ADDED / MODIFIED / REMOVED). Archiving a change merges its deltas into the main
  specs and moves the folder to `changes/archive/`.

🔗 In my SDD notes, each dated feature folder described one phase, and the folders built up as
history. OpenSpec splits these into the current truth (specs) and history (archive). That makes
it a good fit for brownfield code: a change describes only what moves.

## Key concepts
| Term | Meaning | 🔗 SDD equivalent |
|---|---|---|
| Capability | One area of behavior (`auth`, `billing`), with one `spec.md` | Part of the constitution + feature specs |
| Requirement | `### Requirement:` using SHALL/MUST, with at least one scenario | Scope item in `requirements.md` |
| Scenario | `#### Scenario:` written as WHEN / THEN | Checks in `validation.md` |
| Change | Folder with proposal, design, tasks and delta specs | Feature spec folder |
| Delta | ADDED / MODIFIED / REMOVED / RENAMED requirements | Amendment, made explicit |
| Artifact | One planning file of a change (proposal, specs, design, tasks) | `requirements` / `plan` / `validation` |
| Schema | Defines which artifacts exist and their order (default `spec-driven`) | My folder conventions |
| Profile | Which slash commands are installed: `core` (default) or `custom` | — |
| Archive | Merge deltas into the main specs, then file the change away | Merge + update roadmap/changelog |

## Repository layout
    openspec/
      config.yaml           schema, project context, per-artifact rules   🔗 mission + tech-stack
      specs/
        <capability>/spec.md   current truth: Purpose + Requirements + Scenarios
      changes/
        <change-name>/
          .openspec.yaml    change metadata (schema, …)
          proposal.md       why, what changes, impact                    🔗 requirements.md
          design.md         technical approach, decisions (optional)     🔗 decisions table
          tasks.md          numbered checklist (1.1, 1.2, 2.1 …)         🔗 plan.md groups
          specs/<capability>/spec.md   deltas only
        archive/YYYY-MM-DD-<change-name>/   finished changes
    (+ slash commands / skills that `openspec init` generates for the AI tool)

OpenSpec has **no roadmap, backlog or changelog**. Keep those yourself (or follow what your team
does). `openspec list` shows the changes in flight.

## Spec formats
**Main spec**: `openspec/specs/<capability>/spec.md`
```markdown
# <Capability> Specification

## Purpose
What this capability is for.

## Requirements
### Requirement: Session expiry
The system SHALL expire sessions after 30 minutes of inactivity.

#### Scenario: Idle user
- **WHEN** a user is idle for 30 minutes
- **THEN** the next request is redirected to login
```

**Delta spec**: `openspec/changes/<name>/specs/<capability>/spec.md`
```markdown
## ADDED Requirements          new behavior (appended on archive)
### Requirement: …

## MODIFIED Requirements       existing behavior: write the FULL new version (it replaces the old one)
### Requirement: <exact existing name>

## REMOVED Requirements        behavior going away, with a line on why
### Requirement: …

## RENAMED Requirements
- FROM: `### Requirement: Old`
- TO: `### Requirement: New`
```
- Add `## Purpose` only to a delta that creates a brand-new capability.
- When unsure whether to use ADDED or MODIFIED, open the main spec and check whether the
  requirement already exists. Using the wrong one leaves duplicates, or leaves nothing to replace.
- To remove a capability's last requirement (which deletes its spec file), you must add
  `retire_capabilities: true` to `.openspec.yaml`.

## Workflow
Slash commands go in the AI chat. `openspec …` commands go in the terminal.

| # | Step | Command | Files | Done when | 🔗 SDD step |
|---|---|---|---|---|---|
| 0 | Set up (once) | `openspec init` | `openspec/`, `config.yaml`, AI tool commands | Context filled in `config.yaml` | Constitution |
| 1 | Explore (optional) | `/opsx:explore` | none (it doesn't write code) | Scope is clear | Interview before the spec |
| 2 | Propose | `/opsx:propose <name>` | proposal, deltas, design, tasks | Artifacts written | Feature spec |
| 3 | Review the plan | read + `/opsx:update` · `openspec validate <name>` | same artifacts | You agree; validate passes | Review the spec |
| 4 | Implement | `/opsx:apply` | code + tests; tasks ticked off | Every task done | Implement, group by group |
| 5 | Verify | `/opsx:verify` (expanded) · tests | — | No CRITICAL findings | Validate |
| 6 | Merge | PR (your team's process) | — | Merged | Merge |
| 7 | Archive | `/opsx:archive` (or `openspec archive <name>`) | deltas → `specs/`, folder → `archive/` | Main specs updated | Update & replan |

Archiving is how the specs stay true, so never skip it. Agree with your team on *when* to
archive: in the same PR as the code (recommended, so specs and code merge together) or after
the merge.

## Slash commands
**Core profile (default)**
| Command | What it does |
|---|---|
| `/opsx:explore` | Think through an idea with the AI. Writes nothing unless you ask |
| `/opsx:propose <name>` | Creates the change and all planning artifacts in one step |
| `/opsx:apply` | Works through `tasks.md`, ticking tasks off |
| `/opsx:update` | Revises the artifacts and keeps them consistent with each other (🔗 amendment) |
| `/opsx:sync` | Merges deltas into the main specs but keeps the change active (rarely needed) |
| `/opsx:archive` | Finalizes the change: syncs specs, moves it to the archive |

**Expanded** (to enable: `openspec config profile`, pick the workflows, then `openspec update` in the project)
| Command | What it does |
|---|---|
| `/opsx:new <name>` | Creates only the change folder + `.openspec.yaml` |
| `/opsx:continue` | Creates the *next* artifact whose dependencies are met, one at a time |
| `/opsx:ff` | Fast-forward: creates all planning artifacts in order |
| `/opsx:verify` | Checks the code against the artifacts: CRITICAL / WARNING / SUGGESTION findings (doesn't block archive) |
| `/opsx:bulk-archive` | Archives several finished changes and resolves spec conflicts between them |
| `/opsx:onboard` | Guided tutorial: runs a real small change on your codebase (15–30 min) |

`new` + `continue` lets you review artifacts one at a time. `propose` or `ff` creates them all at
once. For large or unfamiliar changes, prefer one at a time (🔗 "review the spec carefully").

## CLI cheat sheet
| Command | Use |
|---|---|
| `npm install -g @fission-ai/openspec@latest` | Install / upgrade |
| `openspec init [--tools claude,…]` | Set up a project |
| `openspec update [--force]` | Regenerate AI tool files after upgrading or changing the profile |
| `openspec list [--specs \| --changes]` | What exists / what's in flight |
| `openspec show <item> [--deltas-only]` | Read a change or spec |
| `openspec view` | Interactive dashboard |
| `openspec status --change <name>` | Which artifacts are done |
| `openspec validate [<name> \| --all] [--strict]` | Check format + MODIFIED requirements against the main specs (good in CI) |
| `openspec archive <name> [-y]` | Archive from the terminal |
| `openspec instructions <artifact> --change <name>` | Shows what the AI is told when writing that artifact |
| `openspec schemas` · `openspec schema fork spec-driven <name>` | List / customize workflows |
| `openspec config profile` | Pick the core or custom command set |
| `openspec doctor` | Read-only health check |

Beta (multi-repo): **stores** (`openspec store …`) share specs across repos. `references:` in
`config.yaml` pulls their specs in as read-only context.

## Customizing
**`openspec/config.yaml`**: project context, injected into every instruction
```yaml
schema: spec-driven
context: |
  Product: <one line>. Stack: <language, frameworks>. Conventions: <…>.
rules:
  proposal:
    - Keep scope to one user-visible slice.
  tasks:
    - Each task group ends with a check that leaves the repo working.
```
🔗 `context` takes the place of mission + tech-stack, and `rules` is where you put SDD habits
(tiny slices, groups ending with a Check, tests on every commit).
On an existing project, OpenSpec won't overwrite `context`, so edit it by hand.

**Custom schema**: `openspec schema fork spec-driven my-flow` copies `schema.yaml` + templates
into `openspec/schemas/my-flow/`. Edit them to add or reorder artifacts, e.g. a
`validation.md` merge bar (🔗 my SDD `validation.md`). `openspec schema validate` checks the result.

## Best practices
**Specs**
- One change = one small, user-visible slice (🔗 tiny phases). Name changes with a verb in
  kebab-case: `add-dark-mode`, `fix-session-expiry`.
- Every requirement needs at least one scenario. Scenarios are your acceptance tests.
- MODIFIED means writing out the full new requirement, not just the diff.
- Put decisions and their *why* in `design.md` (🔗 decisions table).
- Brownfield: don't retro-spec everything. Specs grow one change at a time
  (🔗 "don't retro-spec existing code").

**Implementation**
- Read and fix the artifacts *before* `/opsx:apply`. That review is the whole point.
- If reality differs from the plan, run `/opsx:update` first, then change the code
  (🔗 amendment before code).
- Group tasks so each group leaves the repo working, and commit per group (🔗 plan groups).

**Review & merge**
- Run `openspec validate --strict` + tests in CI.
- Use `/opsx:verify` (or a review in a fresh context) before merging. Verify findings before acting on them.
- Archive so `specs/` matches the code that ships.

## Working with an agent
**Explore → propose**
> /opsx:explore <idea>. Read the relevant main specs and code first. Ask me about scope and
> open questions before proposing anything.

then `/opsx:propose <change-name>`.

**Brownfield first change** (no specs yet)
> Fill `openspec/config.yaml` `context` from the README, code and git history. Mark what you
> inferred vs. couldn't tell, and ask me about the gaps. Don't write main specs for existing code.

Rules for the agent:
- Don't write code before the change's artifacts are reviewed and agreed.
- Code differs from the spec → `/opsx:update` the artifacts first.
- Tick a task only when it's done and its tests pass.
- Confirm before outward actions (push, PR, merge, archive on a shared branch).

## Older versions (0.x)
Repos set up with OpenSpec 0.x may use `/openspec:proposal`, `/openspec:apply`,
`/openspec:archive`, plus `openspec/project.md` and `AGENTS.md` for context. The concepts are
the same. `openspec init`/`update` with a 1.x CLI migrates them (see the migration guide).
