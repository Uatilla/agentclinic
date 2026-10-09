# Lesson 04 — Spec-Driven Development: Notes & Prompts

> Personal study notes for the DeepLearning.AI *Spec-Driven Development with Agentic Coding Assistants* course.
> Project: **AgentClinic** — a place for AI agents to get relief from their humans.

---

## 1. What is Spec-Driven Development (SDD)?

**SDD = write the *what* and *why* down as specs first, then let the coding agent produce the *how*.**

Instead of chatting an agent into writing code ("vibe coding"), the source of truth lives in
version-controlled Markdown files that both humans and agents read. Code is an output of the specs;
when something needs to change, change the spec first and let the code follow.

Why it matters when working with AI agents:

- **Agents have no memory between sessions.** Specs on disk are the persistent context — any new
  session (or a different agent entirely) can read `specs/` and pick up where the last one left off.
- **Less drift.** The agent checks its work against written decisions instead of guessing intent.
- **Reviewable.** Decisions are in files, so they can be diffed, reviewed, and committed like code.
- **Small steps.** Work is broken into tiny phases, each easy to verify and merge.

---

## 2. The workflow at a glance

```
Stakeholder input (README.md)
        │
        ▼
Constitution  ──  specs/mission.md, tech-stack.md, roadmap.md      ← Lesson 04 (this one)
        │
        ▼
Feature spec  ──  specs/YYYY-MM-DD-feature/plan.md,                 ← next lesson
                  requirements.md, validation.md
        │
        ▼
Implement  →  Validate  →  Merge  →  Replan (update roadmap)  →  next phase …
```

---

## 3. The Constitution

The constitution is the set of **project-wide, long-lived specs** that every later feature refers back to.

| File | Answers | Example content for AgentClinic |
|------|---------|--------------------------------|
| `mission.md` | *Why* does this exist, and *for whom*? | Purpose, target audience, goals |
| `tech-stack.md` | *With what* do we build it? | TypeScript (server-side), recommended framework, SQLite |
| `roadmap.md` | *In what order*? | Very small, sequential phases of work |

Key ideas:

- **Inputs come from stakeholders.** The README holds what each stakeholder wants; the constitution
  turns those wishes into decisions:
  - Mary (engineering) → reliable, popular TypeScript stack, dashboard → `tech-stack.md`
  - Susan (product) → agents, ailments, therapies, appointments → `roadmap.md` phases
  - Steve (marketing) → attractive, modern-browser site → `mission.md` / `tech-stack.md`
- **Phases should be very small.** Small phases = small feature specs = easy-to-review diffs.
- **The constitution is living.** It gets refined (Prompts 3–5) and later replanned after features ship.

---

## 4. Prompts used (annotated)

### Prompt 1 — Set the context

```
We are writing AgentClinic, a place for AI agents to get relief from their humans.
Look in the README.md for input from stakeholders.
```

📝 Give the agent the project's one-line pitch and point it at the raw requirements.
No code yet — just orienting the agent.

### Prompt 2 — Create the constitution

```
Let's create a "constitution" in a specs directory:
- `mission.md`
- `tech-stack.md`
- `roadmap.md` for high-level implementation order, in very small phases of work.

Important: You *must* use your AskUserQuestion tool, grouped on these 3, before writing to disk.
```

📝 Two techniques worth remembering:

1. **Name the exact files and their purpose** — the agent produces a predictable structure.
2. **Force questions before writing** (`AskUserQuestion`, grouped by file). The agent surfaces its
   assumptions and *you* make the decisions, instead of it inventing them silently. This is the
   human-in-the-loop part of SDD.

### Prompt 3 — Decide the stack

```
Use server-side TypeScript and recommend a framework.
```

📝 State the hard constraint (TypeScript, server-side) but let the agent propose the details.
In the course, this ends up as **Hono** (see Lesson 05: "Hello Hono").

### Prompt 4 — Refine the mission's audience

```
Add a target audience to the mission:
- Course students learning spec-driven development with AI coding agents
- Developers giving AI coding demos at conference booths
```

📝 Refinement happens **in the spec**, not in code. A clear audience shapes later choices
(e.g. simple setup, demo-friendly UI).

### Prompt 5 — Add the database

```
In tech stack add that we use SQLite.
```

📝 Same pattern: a small, targeted edit to one constitution file.

---

## 5. Takeaways

- Specs are the **source of truth**; code follows them.
- Make the agent **ask before it writes** — decisions should be yours.
- Keep roadmap phases **tiny**.
- **Iterate on specs with short follow-up prompts** (Prompts 3–5) rather than rewriting everything.
- Everything lives in `specs/` and gets committed, so any agent/session can pick it up.

---

## 6. Review notes / to-do

- [ ] `specs/` doesn't exist in this project folder yet — run Prompt 2 (and 3–5) to generate the
      constitution, then compare against the course's reference
      (`../sc-spec-driven-development-files/Video06_Feature_Specification/specs/` and `example_specs/`).
- [ ] Initialize git (`git init`) — the later lessons rely on branches per feature and merging to `main`.
- [ ] Next lesson: feature specs (`plan.md`, `requirements.md`, `validation.md`) for the first roadmap phase.
