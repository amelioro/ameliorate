# Home page accessibility: axe and PageSpeed

## Summary

Get the logged-out home page passing axe on desktop and on mobile, then confirm that gets PageSpeed's accessibility score to 100 on mobile and desktop.

The check is a manual command, not a CI job. It starts green by excluding every known failure. Each fix commit removes its own exclusion, so the commit history shows what was fixed.

This does not make the page WCAG 2.2 AA conformant. See [Not covered](#not-covered).

## 1. Set up `npm run e2e:test:a11y`

- Install `@axe-core/playwright` in the host `e2e` package and commit its lockfile. The container mounts the host's `e2e` directory over `/app`, so rebuilding the image alone won't provide it.
- Add `test:a11y` (`npx playwright test a11y`) and `container:test:a11y` to `e2e/package.json`, and `e2e:test:a11y` to the root `package.json`, matching the existing script pattern.
- The app must already be running (`npm run dev`), because the Playwright config has no `webServer`.
- Add `e2e/tests/a11y.spec.ts`, scanning three states: desktop, mobile (375×800), and mobile with the site drawer open.
- Run axe with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice`.
- Exclude failures by rule with `.disableRules(excludedRules)`. This turns a rule off for the whole page until it's removed, but selectors are brittle and would turn off every rule on those elements.

```ts
/**
 * Known failures. Delete a rule in the commit that fixes it.
 * Each comment covers what's wrong, why fixing it helps, and the fix.
 */
const excludedRules = [
  // <html> has no `lang`. Screen readers use it to choose pronunciation, so without it they can
  // read the page with the wrong voice.
  // Fix: add lang="en".
  "html-has-lang",

  // The mobile menu button only contains a hidden icon and has no name. Screen reader users
  // can't tell that it opens the site navigation.
  // Fix: add aria-label="Open site navigation".
  "button-name",

  // The site drawer is a dialog with no name. Screen readers announce the name when focus moves
  // in, so users aren't told what just opened.
  // Fix: add an aria-label.
  "aria-dialog-name",

  // Headings skip levels (h1 to h4, then h4 to h6). Screen reader users often navigate by heading
  // level, and skipped levels make it look like sections are missing.
  // Fix: use h2 for sections and footer columns, and h3 for cards.
  "heading-order",

  // The drawer's <hr> dividers sit directly in its <ul>, which should only contain <li>. Screen
  // readers depend on that structure to announce lists. Chromium still exposes this list
  // correctly, so the impact is probably small, but other browsers may not.
  // Fix: wrap each divider in an <li>.
  "list",

  // Footer links are 20px tall. Small, tightly spaced targets are hard to hit with tremors or
  // limited dexterity, and on touchscreens.
  // Fix: add padding to make them 24px tall.
  "target-size",

  // #4AB84E is about 2.5:1 as text, and needs 4.5:1. Low contrast is hard to read with low vision,
  // on a dim screen, or in bright light.
  // Fix: change primary to #2E7D32.
  "color-contrast",

  // Links in hidden carousel slides can still take focus. `aria-hidden` hides them from screen
  // readers, so keyboard users can land on something that's announced as nothing.
  // Fix: remove the links from the cards. This also fixes nested-interactive.
  "aria-hidden-focus",

  // The selected card is a role="button" containing a link. Screen readers treat a button's
  // contents as plain text, so the link can be unannounced or unreachable.
  // Fix: remove role="button" and the link. This also fixes aria-hidden-focus.
  "nested-interactive",
];
```

The failure list came from production with axe-core 4.14.0. Local validation of step 1 also found
`button-name` on the mobile menu button, so it is included in the baseline above.

## 2. Fix one rule at a time

Repeat for each rule, in the order above:

1. Delete the rule from `excludedRules` and confirm the test fails on it.
2. Make the fix until `npm run e2e:test:a11y` passes.
3. Check the change visually in the browser, including mobile.
4. Get approval, then commit the fix and the exclusion removal together.

`aria-hidden-focus` and `nested-interactive` share a fix, so they go in one commit.

A failing run holds the terminal while the HTML reporter serves its report, like the other e2e commands, so press Ctrl+C to exit. The container also needs an interactive terminal. In a non-interactive shell, run `PLAYWRIGHT_HTML_OPEN=never npm run test:a11y` from `e2e/` instead.

Notes on specific fixes:

- **`html-has-lang`:** set it in [\_document.page.tsx](../../src/pages/_document.page.tsx).
- **`button-name`:** add `aria-label="Open site navigation"` to the `IconButton` in [SiteMenu.tsx](../../src/web/common/components/Header/SiteMenu.tsx), then use that name to locate it in the accessibility test.
- **`aria-dialog-name`:** add `slotProps={{ paper: { "aria-label": "Site navigation" } }}` in [SiteDrawer.tsx](../../src/web/common/components/SiteDrawer/SiteDrawer.tsx). A visible heading with `aria-labelledby` is equally valid, but it would add a row that sighted users don't need.
- **`heading-order`:** set levels with `component` and keep each `variant`, so the look doesn't change. Make the slogan one heading.
- **`list`:** MUI's `Divider component="li"` still fails, because it adds `role="separator"`. Use a plain `<li>` around the `Divider`.
- **`target-size`:** add `[&_a]:py-0.5` in [Footer.tsx](../../src/web/home/Footer.tsx).
- **`color-contrast`:** replace `primary.main` in [theme.ts](../../src/web/common/theme.ts) and update its comment. No new palette color or component overrides are needed. Contained buttons switch to white text automatically (5.13:1), which also fixes their hover contrast and the email field borders. This changes the whole app, so check the diagram UI too.
- **`aria-hidden-focus` and `nested-interactive`:** remove the link and `role="button"` from [the cards](../../src/web/home/ExamplesSection.tsx), keeping the "See in the app" link below. That alone would leave nothing in the carousel reachable by keyboard, so add Previous/Next buttons outside the slides, using `carouselRef`'s `slickPrev`/`slickNext`, disabled at the ends. Keyboard-test them by hand, because axe won't.

## 3. Confirm PageSpeed reaches 100

- Baseline on production (2026-11-01, Lighthouse 13.6.0): 80 on mobile and 85 on desktop. The failing audits were `button-name` (mobile only), `aria-hidden-focus`, `color-contrast`, `html-has-lang`, `target-size`, and `heading-order`, which steps 1 and 2 all fix.
- Run <https://pagespeed.web.dev/> for mobile and desktop against the PR's Netlify deploy preview, so this can happen before merging, then again on production after merging. An agent can run this through the browser tools.
- For a URL that isn't public, use `npx lighthouse <url> --only-categories=accessibility` from a normal terminal, adding `--preset=desktop` for desktop. Chrome can't start inside the Bash sandbox.
- If the score is under 100, add the failing audit's rule to the test if axe supports it, then fix it with the step 2 loop. Simulating these fixes on production reached 100 with Lighthouse's settings, but a real run may differ.
- Hand-check the remaining "needs review" items once: the hero caption and "Alpha" label (text over images), the "Break things down" heading, and carousel cards cut off at the screen edge.

## Not covered

These are real issues that axe and PageSpeed don't detect, or that this plan doesn't scan. They should be handled separately:

- Keyboard focus indicators need separate work. The theme's reduced ripple opacity hides focus on outlined and text buttons and tabs, and `InputBase` removes the email fields' outline.
- The hero loses content at high zoom, and the sticky header can hide focused elements.
- Three demo GIFs loop forever with no pause control.
- Diagram alt text doesn't describe the diagrams.
- Email fields rely on placeholders, and the subscribe confirmation isn't announced.
- Logged-in states aren't scanned.

## Validation

- `npm run e2e:test:a11y` passes with `excludedRules` and `.disableRules()` removed.
- `npm run check-types`, `npm run lint`, and `npm run check-pretty` pass.
- PageSpeed shows 100 on mobile and desktop.
