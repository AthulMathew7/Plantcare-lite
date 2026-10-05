import colors from '../src/constants/colors';

describe('colors design system', () => {
  it('has all required color tokens', () => {
    const required = [
      'primary',
      'primaryLight',
      'backgroundTint',
      'white',
      'ink',
      'secondaryText',
      'border',
      'coral',
      'confidenceHigh',
      'confidenceMedium',
      'confidenceLow',
      'statusDiseased',
      'statusHealthy',
      'statusUncertain',
    ];
    for (const key of required) {
      expect(colors).toHaveProperty(key);
      expect(colors[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('primary color matches design spec (#98CC6B)', () => {
    expect(colors.primary).toBe('#98CC6B');
  });

  it('coral accent matches design spec (#ED7A3B)', () => {
    expect(colors.coral).toBe('#ED7A3B');
  });
});
