# SDD — Spec-Driven Development guide

Specs (Markdown in `specs/`) are the source of truth: code follows them, every session and
agent shares context through them, and every decision stays reviewable in git.
**Change the spec before the code.**

## Key concepts
| Term | Meaning |
|---|---|
| Constitution | Project-wide, long-lived specs: mission, tech stack, roadmap |
| Phase | One small, user-visible slice from the roadmap, mergeable on its own |
| Milestone | Consecutive phases that only make sense together: one branch, a checkpoint per phase |
| Feature spec | Dated folder with requirements, plan and validation for one phase/milestone |
| Plan group | A numbered set of tasks that ends with a **Check** and leaves the repo working |
| Checkpoint | A stop after a finished phase to test it before building on it |
| Amendment | A dated note + edits to a spec when reality differs from the plan |
| Merge bar | `validation.md`: every box ticked, each with evidence (test, measure, CI run, person) |
| Replan | Short roadmap review after each merge, before the next spec |
| Backlog | Ideas and research not yet committed; promoted to the roadmap on purpose, never built directly |

## Repository layout
    specs/
      mission.md          why, for whom, scope, principles
      tech-stack.md       language, frameworks, quality rules, conventions
      roadmap.md          phases in order, each linked to its spec
      backlog/            ideas + research, not committed (README: "don't implement")
      YYYY-MM-DD-<name>/
        requirements.md   context, scope in/out, decisions table (+ amendment notes)
        plan.md           numbered task groups, each with a Check
        validation.md     automated + manual checks = the merge bar
    CHANGELOG.md          what changed, per date, in plain language

## Workflow
🧹 clear context (only when the next step is fully on disk) · ⏸ keep context

| # | Step | Files | Done when | Context |
|---|---|---|---|---|
| 1 | Constitution | `mission`, `tech-stack`, `roadmap` | Committed | 🧹 after |
| 2 | Pick next phase | branch (one per phase or milestone) | Branch created | ⏸ |
| 3 | Feature spec | `requirements`, `plan`, `validation` | Questions answered, files written | ⏸ |
| 4 | Review the spec | same 3 files (amendment) | Gaps fixed, spec committed before code | 🧹 after |
| 5 | Implement | code + tests, one group per commit | Every group's Check passes | ⏸ in group, 🧹 between |
| 6 | Validate | review findings → amendment → fix group; `validation.md` | Every box ticked with evidence | 🧹 before |
| 7 | Merge | pull request | CI green on the PR, merged | — |
| 8 | Update & replan | `roadmap` (done after merge), `CHANGELOG`, notes | Replan committed | 🧹 → step 2 |

## Best practices
**Specs**
- Tiny phases: small spec, small diff, easy review.
- Decisions table: choice + *why*, so later readers (and agents) don't reopen them.
- Review the spec carefully before coding; re-review after the first group only if the phase
  is large or unfamiliar, or the first group surprised you.
- Never let code drift: amend the spec (dated note), commit, then change code.

**Implementation**
- One group at a time: build → test → fix → commit → summary → ask before the next.
- Every group leaves the repo working; tests run on every commit.

**Testing**
- Expected values come from the spec/fixtures, never from the code under test.
- Old tests failing after a spec change is expected: updating them *is* following the spec.
- Automated ≠ done: manual checks catch look and layout; tests can pass on a broken page.
- Prove a test catches the problem: break the code briefly and watch it fail.

**Review**
- Always review in a fresh context; for milestones or risky changes, use several angles
  (spec conformance, code/tests, UX/accessibility), since each finds different problems.
  Verify findings before acting on them.

## Changing the constitution
- Own branch and PR by default (it governs every phase).
- If a feature depends on the change: ship both together, or merge the constitution first.

## Replanning
- After every merge, before the next spec: what changes the next phase?
  "Roadmap still holds" is a valid answer.
- Touch mission/tech stack only if a rule changed. Mid-phase changes → amend that phase's spec instead.
- New ideas → backlog: keep entries short (idea, research/links, status: raw · researched ·
  promoted · dropped). Mark dropped ideas with the reason instead of deleting them.
- Promote on purpose: backlog → roadmap → feature spec. Never spec straight from the backlog.
- Commit the replan on its own.

## Working with an agent
Prompt templates (replace `<…>`). Each ends with the interview line, so the agent asks before writing.

**Constitution, greenfield**
> We're building <project>: <one-line pitch>. Stakeholder input is in <file>.
> Create a constitution in `specs/`: `mission.md`, `tech-stack.md`, and `roadmap.md` in very
> small phases, ordered by <TODO / priorities>.
> Interview me about mission, target audience and tech-stack gaps.
> You *must* use AskUserQuestion, grouped per file, before writing to disk.

**Constitution, brownfield**
> This is an existing project: <one-line pitch>. Read the code, README and git history first.
> Create a constitution in `specs/` describing what *is*: `mission.md`, `tech-stack.md`
> (actual stack + conventions found in the code), `roadmap.md` (existing work as done, then
> next work in very small phases). Separate what you inferred from what you couldn't tell.
> Interview me about the gaps.
> You *must* use AskUserQuestion, grouped per file, before writing to disk.

Brownfield: don't retro-spec existing code. The constitution captures the present;
feature specs start with the next change.

**Feature spec**
> Find the next phase in `specs/roadmap.md`, create a branch, and interview me about the spec.
> Create `specs/YYYY-MM-DD-<feature>/` with `requirements.md` (scope, decisions, context),
> `plan.md` (numbered task groups, each with a Check) and `validation.md` (how we know it
> succeeded and can be merged). Follow `specs/mission.md` and `specs/tech-stack.md`.
> You *must* use AskUserQuestion, grouped per file, before writing to disk.

Repeated prompt → make it a skill (see `skills.md`).

Rules for the agent:
- Ask before writing specs; surface assumptions, let the human decide.
- Follow the plan one group at a time; report results and ask before the next group.
- If the code must differ from the spec, propose an amendment first.
- Tick validation boxes only with evidence; never merge before every box is ticked.
- Treat `specs/backlog/` as unapproved ideas: read for context, never implement from it.
- Confirm before outward actions (push, PR, merge, deleting branches).
