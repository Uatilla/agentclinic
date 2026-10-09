# SDD — Lesson 04: The Constitution

## Core idea
Specs (Markdown in `specs/`) are the source of truth; code follows them.
They give the agent persistent context across sessions and make decisions reviewable.

## SDD workflow (end to end)
🧹 = clear context · ⏸ = keep context
1. **Constitution** — mission, tech stack, roadmap (tiny phases). Commit.
   🧹 after commit: everything now lives on disk.
2. **Pick next phase** — from the roadmap; create one branch per phase.
   ⏸ go straight into the spec.
3. **Feature spec** — dated dir in `specs/`: `requirements.md` (scope, decisions, context),
   `plan.md` (numbered task groups), `validation.md` (merge bar). Ask before writing.
   ⏸ the reasons behind the answers are still fresh for the review.
4. **Review the spec** — highest-leverage moment: fix ambiguity, hidden assumptions,
   untestable checks, scope creep. Commit the spec before any code.
   🧹 after commit: implementation must work from the spec alone.
5. **Implement** — one task group at a time; check, commit, repeat.
   ⏸ while fixing failures inside a group · 🧹 between groups, after commit.
6. **Validate** — run `validation.md`; fix gaps in the same session.
   🧹 before: a fresh reviewer has no bias from the session that wrote the code · ⏸ while fixing.
7. **Merge** — PR shows spec + code; CI green → merge to `main`.
8. **Update & repeat** — mark the phase done in the roadmap, amend specs if reality
   changed, commit.
   🧹 then go to step 2.

## Constitution = project-wide, long-lived specs
- `mission.md` — why / for whom → resolves ambiguous choices
- `tech-stack.md` — built with what → keeps the stack consistent
- `roadmap.md` — in what order → very small phases (small spec, small diff, easy review)

## Prompt pattern
> Give context (one-line intent + where the requirements live).
> Create a constitution in `specs/`: mission, tech-stack, roadmap (very small phases).
> You *must* use AskUserQuestion, grouped per file, before writing to disk.

- **Ask before writing:** the agent surfaces its assumptions and you make the decisions (human in the loop).
- **Grouped per file:** focused rounds of questions.
- **Refine with small follow-ups**, editing the spec rather than the code
  (e.g. "add a target audience to the mission", "add SQLite to the tech stack").

## When to clear context
Rule: clear when the next step can be fully described by files on disk.
- ✅ Between steps: constitution → feature spec → implement → validate → next feature.
- ✅ Before validation: a fresh context reviews without bias from the session that wrote the code.
- ❌ For small fixes within a feature: stay in the session, since the failure details are already in context.
- 🔄 For a change of direction: update the spec, commit, then clear.
- Never clear with uncommitted work or decisions that exist only in the chat.

## Takeaways
- Spec first, code second; change the spec before the code.
- Keep phases tiny.
- Commit `specs/` so any agent or session can pick up where the last left off.
