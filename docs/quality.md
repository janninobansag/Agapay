# Accessibility and performance

Agapay treats accessibility and performance as release requirements. The browser
audit is intentionally run against an optimized, production-style Next.js build
in the ignored `.next-e2e` directory.

## Accessibility

`npm.cmd run test:a11y` runs axe against the public landing, sign-in, and
sign-up pages. It also verifies that keyboard focus is visibly indicated. The
global stylesheet provides a high-visibility focus outline and honors reduced
motion preferences.

Automated tools do not replace manual review. Before release, verify keyboard
navigation, screen-reader labels for authenticated workflows, zoom at 200%, and
map interactions with a keyboard alternative.

## Performance

`npm.cmd run test:performance` measures the production landing page in Chromium.
It fails when any of these budgets are exceeded:

| Measure | Budget |
| --- | ---: |
| DOM content loaded | under 2.5 seconds |
| Full load | under 4 seconds |
| Resource count | fewer than 80 |
| Initial transferred resources | under 1.5 MB |

The timing test is a repeatable local and CI regression check, not a substitute
for field data on real devices and networks. Run a manual production Lighthouse
audit before a public launch.
