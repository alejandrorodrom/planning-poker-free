/**
 * Breakpoints in px. Keep in sync with `--bp-*` in `src/lib/styles/tokens.css`.
 * CSS `@media` cannot use custom properties, so the px literals must match these values.
 */
export const BP_XS = 420;
export const BP_SM = 576;
export const BP_MOBILE = 720;
export const BP_MD = 768;
export const BP_LG = 992;
export const BP_XL = 1200;

/** Exclusive upper bound for “below SM” queries (`max-width: 575px`). */
export const BP_SM_MAX = BP_SM - 1;

/** Exclusive lower bound for “above mobile” queries (`min-width: 721px`). */
export const BP_MOBILE_MIN = BP_MOBILE + 1;

export const mqMax = (bp: number) => `(max-width: ${bp}px)`;
export const mqMin = (bp: number) => `(min-width: ${bp}px)`;
