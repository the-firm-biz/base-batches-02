import { extractHorsepowerValue } from './extract-horsepower-value.js';
import {
  VALID_HORSEPOWER_EXTRACTION_CASES,
  INVALID_HORSEPOWER_STRINGS
} from './horsepower-test-data.js';

describe('extractHorsepowerValue', () => {
  describe('should extract HP values from valid strings', () => {
    VALID_HORSEPOWER_EXTRACTION_CASES.forEach(({ input, expected }) => {
      it(`should extract ${expected} from: "${input}"`, () => {
        expect(extractHorsepowerValue(input)).toBe(expected);
      });
    });
  });

  describe('should return null for invalid strings', () => {
    INVALID_HORSEPOWER_STRINGS.forEach((testString) => {
      it(`should return null for: "${testString}"`, () => {
        expect(extractHorsepowerValue(testString)).toBeNull();
      });
    });
  });
});
