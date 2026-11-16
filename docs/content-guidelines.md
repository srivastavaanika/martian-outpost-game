# Content and accessibility guidelines (ages 7-12)

## Writing

- **Reading level:** aim for ages 7-8 (about US grade 2-3) for choice titles and descriptions; the debrief "lesson" text can stretch to ages 10-12.
- **Short:** one idea per sentence; choice titles 32 characters or fewer and descriptions 110 or fewer (enforced by tests).
- **Concrete verbs:** "Clean the solar panels", not "Perform photovoltaic maintenance".
- **Explain a science word the first time**: "regolith (Mars soil)", "electrolysis (splitting water)". Add new words to `docs/glossary.md`.
- **Voice:** encouraging, curious, second person ("you", "your crew"). The player is the commander.
- **Losses are learning moments**, never punishments: "The power ran out!" plus what planners do about it. No death, injury or blame wording.
- **Honesty:** if a number is a game rule, don't call it a NASA fact. Say "real" only for real data.
- **Units:** use mSv for radiation, but always pair it with a comparison or a bar so kids don't need to understand the unit.

## Visual and interaction

- Touch targets at least 48 px; cards and buttons are large (`min-h-48` cards, `py-3`+ buttons).
- Never use colour as the only signal: danger states add ⚠️ and text, and gains and costs show `+` / `-` signs.
- Contrast: text on cards meets WCAG AA (light text on `slate-800/900`).
- Respect `prefers-reduced-motion` (handled globally in `src/index.css`).
- Keyboard: everything is a real `<button>` or `<a>`, with a visible focus ring (yellow outline).
- Screen readers: resource bars use `role="meter"` with values; decorative emoji are `aria-hidden`.
- Layout works at 375 px wide (phones) through desktop.

## Sound (when added)

- Off by default or a clear mute button; start audio only after the first click (browser autoplay rules).

## Checklist for new content

- [ ] Could a 7-year-old read the title and description aloud?
- [ ] Does the choice have a real-world lesson that is true?
- [ ] Is anything presented as "real" actually sourced in `docs/data-sources.md`?
- [ ] No scary or violent wording?
