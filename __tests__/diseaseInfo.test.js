import diseaseInfo from '../src/constants/diseaseInfo';
import {
  DISEASES_WITHOUT_VERIFIED_IMAGE,
  getDiseaseImageAssetName,
  getDiseaseImageSource,
} from '../src/constants/diseaseInfo';
import labelMap from '../assets/models/plantcare/label_map.json';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
      expect(typeof entry.short_description).toBe('string');
      expect(typeof entry.symptoms).toBe('string');
      expect(typeof entry.cause).toBe('string');
      expect(typeof entry.prevention).toBe('string');
      expect(typeof entry.cure_status).toBe('string');
      expect(entry.image === null || typeof entry.image === 'string').toBe(true);
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

  it('has complete disease-specific copy without generic fallback text', () => {
    for (const entry of diseaseInfo) {
      for (const field of ['short_description', 'description', 'symptoms', 'cause', 'treatment', 'prevention', 'cure_status']) {
        expect(entry[field].trim().length).toBeGreaterThan(20);
        expect(entry[field]).not.toMatch(/no (cause detail|prevention guidance|treatment guidance) available/i);
      }
    }
  });

  it('does not prescribe unqualified fungicide for mango die-back', () => {
    const dieBack = diseaseInfo.find((entry) => entry.class_name === 'Mango___Die_Back');
    expect(dieBack.treatment).toMatch(/if a local agricultural extension service recommends fungicide use/i);
    expect(dieBack.treatment).toMatch(/appropriately registered product.*recommendation and label/i);
  });

  it('maps every verified photo class to a distinct bundled image and lists unresolved classes', () => {
    const entriesWithImages = diseaseInfo.filter((entry) => entry.image);
    const assetNames = entriesWithImages.map(getDiseaseImageAssetName);
    expect(entriesWithImages).toHaveLength(22);
    expect(new Set(assetNames).size).toBe(22);
    expect(diseaseInfo.filter((entry) => !entry.image).map((entry) => entry.class_name))
      .toEqual(DISEASES_WITHOUT_VERIFIED_IMAGE);

    const photoHashes = assetNames.map((assetName) => crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(__dirname, '..', 'assets', 'diseases', `${assetName}.jpg`)))
      .digest('hex'));
    expect(new Set(photoHashes).size).toBe(22);
    expect(fs.existsSync(path.join(__dirname, '..', 'assets', 'diseases', 'placeholder.jpg'))).toBe(false);

    for (const [index, entry] of entriesWithImages.entries()) {
      const assetName = assetNames[index];
      expect(assetName).not.toContain('placeholder');
      expect(assetName).toBe(entry.image);
      expect(getDiseaseImageSource(entry)).toBeDefined();
      expect(fs.existsSync(path.join(__dirname, '..', 'assets', 'diseases', `${assetName}.jpg`))).toBe(true);
    }
    for (const entry of diseaseInfo.filter((item) => !item.image)) {
      expect(getDiseaseImageAssetName(entry)).toBeNull();
      expect(getDiseaseImageSource(entry)).toBeNull();
    }
  });

  it('maps the four owner-supplied photos to the exact catalog classes and assets', () => {
    const expected = {
      Cassava___Green_Mottle: 'cassava_green_mottle',
      Jackfruit___Algal_Leaf_Spot: 'jackfruit_algal_leaf_spot',
      Jackfruit___Black_Spot: 'jackfruit_black_spot',
      Jackfruit___Healthy: 'jackfruit_healthy',
    };

    for (const [className, assetName] of Object.entries(expected)) {
      const entry = diseaseInfo.find((item) => item.class_name === className);
      expect(entry).toBeDefined();
      expect(entry.image).toBe(assetName);
      expect(getDiseaseImageAssetName(entry)).toBe(assetName);
      expect(getDiseaseImageSource(entry)).toBeDefined();
      expect(fs.existsSync(path.join(__dirname, '..', 'assets', 'diseases', `${assetName}.jpg`))).toBe(true);
      expect(DISEASES_WITHOUT_VERIFIED_IMAGE).not.toContain(className);
    }
    expect(DISEASES_WITHOUT_VERIFIED_IMAGE).toEqual([]);
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
