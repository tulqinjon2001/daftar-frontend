/**
 * Markaziy dizayn qiymatlari.
 * Asosiy ranglar: `src/index.css` dagi `@theme` va `:root` CSS o‘zgaruvchilari.
 * React `style={{}}` da gradient kerak bo‘lsa — CSS var ishlating.
 */
export const appStyles = {
  gradientBalance: { background: "var(--app-gradient-balance)" } as const,
  gradientCta: { background: "var(--app-gradient-cta)" } as const,
} as const;
