# The Margin

An interactive mystery storybook. A 1963 typesetting manual where two hands argue in the margins: a human editor's pencil and a machine's typed notes.

**Status:** playable prototype. Cover plus 3 spreads, one of each clue type (darker words, candle-lit hidden ink, wrong page numbers) and a 4-letter lock.

## Run
Open `index.html` in a browser. No build step.

- `←` `→` or swipe to turn pages (one page at a time on phones)
- `G` shows the canon grid construction

## Layout
Every page follows the Van de Graaf canon. Rules and the CSS recipe: `.claude/skills/canon-grid/SKILL.md`.

Check after any layout change:
```bash
node tests/check-canon.mjs
```

## References
Mood board notes and image credits: `docs/moodboard.md`.

## Fonts
EB Garamond and Caveat (SIL OFL 1.1), Special Elite (Apache 2.0). Licences are in `fonts/`.
