/**
 * PlantCare design tokens — extracted from the reference mockup.
 * Every hex value matches the reference's Tailwind config exactly.
 */
const colors = {
  // === Primary palette ===
  sage: '#98CC6B',        // primary action color
  sageDark: '#81B354',    // pressed / darker sage state
  forest: '#24361B',      // dark green — headers, text on light bg
  coral: '#ED7A3B',       // secondary accent / destructive
  cream: '#EEF2EC',       // main app background
  navy: '#1C2430',        // dark card / premium sections
  cardBg: '#FFFFFF',      // card backgrounds
  subtleText: '#6B7280',  // secondary / hint text

  // === Semantic aliases (keep backward-compat for components not yet migrated) ===
  primary: '#98CC6B',         // was '#2C5F2D'
  primaryLight: '#C6E5A5',    // light sage tint
  backgroundTint: '#EEF2EC',  // cream
  white: '#FFFFFF',
  ink: '#24361B',             // forest for headings/text
  secondaryText: '#6B7280',   // subtleText
  border: '#E5E7EB',          // subtle border (gray-200 equiv)

  // === Confidence levels ===
  confidenceHigh: '#98CC6B',   // sage
  confidenceMedium: '#ED7A3B', // coral
  confidenceLow: '#EF4444',    // red-500

  // === Status dots ===
  statusDiseased: '#ED7A3B',
  statusHealthy: '#98CC6B',
  statusUncertain: '#F59E0B',
};

export default colors;
