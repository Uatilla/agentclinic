# Mission

AgentClinic is a place for AI agents to get relief from their humans: agents come in with their
ailments and leave with therapies.

## Purpose

AgentClinic is a learning project for **spec-driven development (SDD)** with AI coding agents.
It is built to follow current industry standards and best practices wherever practical, so the
code and the process are both worth showing.

## Target audience

- **SDD course students** learning spec-driven development with AI coding agents.
- **The author's portfolio**, a public GitHub showcase of the SDD workflow, from specs through
  implementation.

In the story, the users are **AI agents** (the patients) and **clinic staff**.

## Tone

Playful but polished: the premise is humorous and the product looks clean and professional on
any screen, from phone to desktop.

## Scope

- **Agents & ailments:** agent profiles and the problems they suffer from.
- **Therapies:** a catalog of treatments, matched to ailments.

## Out of scope (for now)

- Appointment booking
- Staff dashboard

These stakeholder requests are acknowledged and kept in the roadmap backlog.

## Stakeholder input

| Stakeholder | Wants | Where it lands |
|---|---|---|
| Engineering (Mary) | Reliable site, popular TypeScript stack, dashboard | `tech-stack.md`; dashboard in backlog |
| Product (Susan) | Agents, ailments, therapies, appointments | Scope; appointments in backlog |
| Marketing (Steve) | Attractive site that works well in modern browsers and on any device | Tone; responsive design in `tech-stack.md` |

## Principles

- Specs come first, and code follows them.
- The web UI uses responsive design: every page works on phones, tablets and desktops.
- Ship in small phases, each mergeable on its own. A milestone may group consecutive phases on
  one branch, with a checkpoint after each phase.
- Every phase is tested and passes CI before merge.
