# SDD — Lesson 04: The Constitution

## Core idea
Specs (Markdown in `specs/`) are the source of truth; code follows them.
They give the agent persistent context across sessions and make decisions reviewable.

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
