import React from 'react';
import SeverityBadge from '../src/components/SeverityBadge';

describe('SeverityBadge component', () => {
  it('returns null when severity is undefined or null', () => {
    expect(SeverityBadge({ severity: null })).toBeNull();
    expect(SeverityBadge({ severity: undefined })).toBeNull();
  });

  it('renders low severity correctly', () => {
    const element = SeverityBadge({ severity: 'low' });
    expect(element).not.toBeNull();
    expect(element.props.accessibilityLabel).toBe('Severity: Low');
  });

  it('renders medium severity correctly', () => {
    const element = SeverityBadge({ severity: 'medium' });
    expect(element).not.toBeNull();
    expect(element.props.accessibilityLabel).toBe('Severity: Medium');
  });

  it('renders high severity correctly', () => {
    const element = SeverityBadge({ severity: 'high' });
    expect(element).not.toBeNull();
    expect(element.props.accessibilityLabel).toBe('Severity: High');
  });

  it('handles uppercase severity strings gracefully', () => {
    const element = SeverityBadge({ severity: 'HIGH' });
    expect(element).not.toBeNull();
    expect(element.props.accessibilityLabel).toBe('Severity: High');
  });
});
