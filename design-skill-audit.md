# Design Skill Installation Audit

## Taste Skill

Source: https://github.com/Leonxlnx/taste-skill

The repository is MIT-licensed and publishes portable agent skills under `skills/`. The project-local installation used the official documented command with the `design-taste-frontend` skill selected:

```text
npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend --yes
```

Installed location: `.agents/skills/design-taste-frontend/SKILL.md`.

Relevant guidance applied here: infer the product and audience before styling, avoid generic AI-purple gradients and over-carded layouts, preserve the existing product identity during scoped redesigns, use a restrained palette with one accent, keep responsive CSS grid layouts, and avoid unnecessary dependencies.

## Impeccable

Source: https://github.com/pbakaus/impeccable

The repository is Apache-2.0 licensed and documents project-local installation through `npx impeccable install`. The project-local Codex-compatible installation completed with the design hook enabled. It created the Impeccable skill and hook files under `.agents/`.

The installed workflow was applied to the existing `client/src/pages/Home.tsx`: context was loaded, the deterministic detector was run, and it returned no findings for the target file. The design pass preserved the existing navy-and-gold identity while giving Kaggle its own information hierarchy.

## Applied UI Direction

The Kaggle card now uses a dedicated visual family with a source-branded hero image, Competition/Kaggle badges, a concise overview, team count, organizer, tags, eligibility, prize-pool emphasis, readable UTC deadline and countdown, and an official View competition action. Kaggle cards do not render the generic cost, mode, or location rows used by other sources.

External source URLs are documented here for provenance only. No external repository scripts were executed beyond the official installers and the installed deterministic detector.
