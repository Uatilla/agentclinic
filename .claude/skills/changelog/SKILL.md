---
name: changelog
description: Create or update CHANGELOG.md in the project root from git history, with one heading per date. Run manually before merging a branch.
disable-model-invocation: true
allowed-tools: Bash(git log:*), Bash(git status:*), Bash(git diff:*), Bash(git show:*), Read, Edit, Write
---

# Changelog

Keep `CHANGELOG.md` in the project root up to date from git history.

## Format

```markdown
# Changelog

All notable changes to this project, newest first.

## YYYY-MM-DD

- Short, past-tense bullet describing what changed and why it matters.
```

- One `## YYYY-MM-DD` heading per day, newest day first. Never repeat a date heading.
- Bullets describe changes to the product, specs, tests or tooling, in plain language. Don't
  copy commit messages word for word, and don't include hashes.
- Merge several commits about the same change into one bullet (e.g. "Add Phase 1 feature
  spec" + "Amend Phase 1 spec" → one bullet about the Phase 1 spec).
- Skip merge commits and commits that only touch personal study notes or fix typos.

## Steps

1. Check whether `CHANGELOG.md` exists in the project root.
2. Collect commits, skipping merges:
   - **No changelog:** all commits:
     `git log --no-merges --date=short --format='%ad %h %s'`
   - **Changelog exists:** read its newest date heading, then list commits from that date on:
     `git log --no-merges --date=short --since='<newest date> 00:00' --format='%ad %h %s'`.
     Leave out commits whose change already has a bullet.
3. Run `git status --short`. If there are uncommitted changes, list them and ask whether to
   include them under today's date (they will be committed with the changelog).
4. When a subject line is unclear, check what changed with `git show --stat <hash>`.
5. Group the commits by date and write the bullets:
   - **New file:** create it with the header above and every date.
   - **Existing file:** add bullets under the existing heading for a date if it's there;
     otherwise add a new date heading above the newest one. Don't rewrite older entries.
6. Show the user the new or changed section and stop. Don't commit; the user decides when.
