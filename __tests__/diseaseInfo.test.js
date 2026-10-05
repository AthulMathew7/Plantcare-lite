import diseaseInfo from '../src/constants/diseaseInfo';
import labelMap from '../assets/models/plantcare/label_map.json';

describe('diseaseInfo seed data', () => {
  it('has exactly 22 disease classes', () => {
    expect(diseaseInfo).toHaveLength(22);
  });

  it('has correct class distribution across 5 crops', () => {
    const cassava = diseaseInfo.filter((d) => d.class_name.startsWith('Cassava___'));
    const coconut = diseaseInfo.filter((d) => d.class_name.startsWith('Coconut___'));
    const jackfruit = diseaseInfo.filter((d) => d.class_name.startsWith('Jackfruit___'));
    const mango = diseaseInfo.filter((d) => d.class_name.startsWith('Mango___'));
    const rice = diseaseInfo.filter((d) => d.class_name.startsWith('Rice___'));

    expect(cassava).toHaveLength(5);
    expect(coconut).toHaveLength(2);
    expect(jackfruit).toHaveLength(3);
    expect(mango).toHaveLength(8);
    expect(rice).toHaveLength(4);
  });

  it('includes Healthy classes for Cassava, Jackfruit, Mango', () => {
    const names = diseaseInfo.map((d) => d.class_name);
    expect(names).toContain('Cassava___Healthy');
    expect(names).toContain('Jackfruit___Healthy');
    expect(names).toContain('Mango___Healthy');
  });

  it('every entry has all required fields', () => {
    for (const entry of diseaseInfo) {
      expect(typeof entry.class_name).toBe('string');
      expect(typeof entry.display_name).toBe('string');
      expect(typeof entry.description).toBe('string');
      expect(typeof entry.treatment).toBe('string');
      expect(typeof entry.severity).toBe('string');
      expect(entry.class_name.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(10);
      expect(entry.treatment.length).toBeGreaterThan(10);
    }
  });

  it('severity values are valid', () => {
    const valid = ['none', 'medium', 'high'];
    for (const entry of diseaseInfo) {
      expect(valid).toContain(entry.severity);
    }
  });

  it('has no duplicate class_names', () => {
    const names = diseaseInfo.map((d) => d.class_name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('matches label_map ordering and contains only the two Coconut classes', () => {
    const names = diseaseInfo.map((d) => d.class_name);
    expect(names).toEqual(Object.keys(labelMap).map((index) => labelMap[index]));
    expect(names.filter((name) => name.startsWith('Coconut___'))).toEqual([
      'Coconut___Gray_Leaf_Spot',
      'Coconut___Leaf_Rot',
    ]);
  });

  it('class_names match what the inference service returns', () => {
    const { DISEASE_CLASSES } = require('../src/services/inferenceService');
    const seedNames = diseaseInfo.map((d) => d.class_name);
    for (const cls of DISEASE_CLASSES) {
      expect(seedNames).toContain(cls);
    }
  });
});
