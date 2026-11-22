---
name: canon-grid
description: Use when laying out, changing, or checking any page or spread in The Margin. Holds the exact math of the Van de Graaf / Tschichold "golden canon" and how to build it in CSS, plus how to verify it.
---

# The golden canon (Van de Graaf construction)

## The rule
For ANY page ratio, the construction divides the page into ninths:

| Part            | Size        |
|-----------------|-------------|
| Inner margin    | 1/9 of page width  |
| Outer margin    | 2/9 of page width  |
| Top margin      | 1/9 of page height |
| Bottom margin   | 2/9 of page height |
| Text block      | 6/9 (= 2/3) of page width and height |

So the text block has the same shape as the page. Margins go inner:top:outer:bottom = 1:1:2:2 only on a 2:3 page; on other ratios use the ninths above.

Classic page ratio is 2:3. Keep it unless told otherwise.

## Spreads
- Left page (verso): inner margin is on the RIGHT.
- Right page (recto): inner margin is on the LEFT.
- The two inner margins together form the gutter (2/9 of one page width), equal to one outer margin.

## Margin notes
Marginalia live in the OUTER margin (2/9 width) and the BOTTOM margin. Never put them in the inner margin; it is too narrow and sits in the fold.

## CSS recipe
Use container units so top/bottom use height and left/right use width:

```css
.page {
  aspect-ratio: 2 / 3;
  container-type: size;
  position: relative;
}
.text-block {
  position: absolute;
  top: calc(100cqh / 9);
  height: calc(100cqh * 6 / 9);
  width: calc(100cqw * 6 / 9);
}
.page.verso .text-block { left: calc(100cqw * 2 / 9); }  /* outer on left */
.page.recto .text-block { left: calc(100cqw / 9); }      /* inner on left */
```

Never hard-code pixel margins. Always derive from the page box.

## Type fits the block
- Pick body size so lines hold about 50-65 characters (body is 3.55cqw in style.css). On screen that gives roughly 20-25 lines per block; keep each page's text short rather than shrinking type.
- Set line-height as a fixed unit and snap all vertical spacing to it (baseline rhythm).
- Text must fit inside the block with no scroll. If it overflows, cut text or reduce lines; do not shrink margins.

## Phones (one page at a time)
Show a single page at the same 2:3 ratio. Treat it as a recto. Turn the spread with swipe.

## Debug overlay
Press `G` to draw the construction: both page diagonals, the spread diagonals, and the text block outline. Keep this in the build; it helps checks and is a nice hidden extra.

## Work order (from BONT's method)
Lay out freely first, then turn on the grid (`G`) and snap edges to its lines and crossings. Where no line fits, use a fixed gap instead of forcing it.

## Verify (do this after every layout change)
Run `node tests/check-canon.mjs` (add `--shots <dir>` for screenshots). It checks 1440x900 and 390x844, measures each `.text-block` against its `.page` and fails if any edge is off by more than 1px from the ninths above, or if any text overflows its block.
