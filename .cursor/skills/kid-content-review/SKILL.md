---
name: kid-content-review
description: Review player-facing text and UI in Martian Odyssey for children aged 7-12 - reading level, tone, honesty about real data, and accessibility. Use when writing or changing choice text, lessons, loss messages, facts, screen copy, labels, or any UI component the player sees.
---

# Kid content review

Source of truth: `docs/content-guidelines.md`. Word choices: `docs/glossary.md`.

## Where player text lives

- `src/engine/choices.ts` - card titles, descriptions, lessons
- `src/engine/engine.ts` - flare messages
- `src/ui/labels.ts` - resource names, `LOSS_MESSAGES`
- `src/data/facts.ts`, `src/data/sources.ts` (`usedFor`)
- `src/ui/*.tsx` - screen copy

## Checklist (report each item as pass or fix)

**Reading**
- [ ] Titles and descriptions readable aloud by a 7-year-old: one idea per sentence, concrete verbs, no jargon. Lessons may stretch to ages 10-12.
- [ ] A science word is explained the first time ("regolith (Mars soil)") and uses the wording in `docs/glossary.md`; new words are added there.
- [ ] Second person, encouraging ("you", "your crew").

**Tone**
- [ ] Losses are learning moments: what happened plus what real planners do. No death, injury, blame or scary wording.
- [ ] Radiation in mSv is paired with a bar or comparison, never a bare number.

**Honesty**
- [ ] "Real" or "NASA" is used only for sourced data (`docs/data-sources.md`). Game rules are not called facts.
- [ ] Nothing static is described as live.

**Accessibility** (UI changes)
- [ ] Colour is never the only signal: icons, text and `+`/`-` signs carry meaning too.
- [ ] Touch targets at least 48 px; everything clickable is a real `button` or `a` with a visible focus ring.
- [ ] Decorative emoji are `aria-hidden`; meters keep `role="meter"` with values.
- [ ] Works at 375 px wide and on desktop - check both in the browser.

## Output

List each problem with file, current text, suggested text and the rule it breaks. If everything passes, say so in one line. Then run `npm run check` (text length limits are tested in `src/engine/design-rules.test.ts`).

## Example

- `src/ui/labels.ts`, `LOSS_MESSAGES.oxygen.title`: "The crew suffocated." -> "The crew ran low on oxygen!" (no death wording)
