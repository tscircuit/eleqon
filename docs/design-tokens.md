# Design tokens

`app/globals.css` is the single source of truth for the dark-only visual theme.
It defines colors, font families, type scale, weights, line heights, tracking,
radii, motion, and shadows.

Component styles must consume those values with `var(--...)`. Keep only
structural layout measurements—such as grid columns, element dimensions, and
content-specific spacing—in component CSS. Add or revise a global token before
introducing a new visual value.
