import { generateSnowflake } from '../src/utils/snowflake';

describe('Snowflake Utils', () => {
  describe('generateSnowflake', () => {
    it('should generate a valid snowflake ID', () => {
      const id = generateSnowflake();
      expect(typeof id).toBe('bigint');
      expect(id > 0n).toBe(true);
    });

    it('should generate unique IDs', () => {
      const id1 = generateSnowflake();
      const id2 = generateSnowflake();
      expect(id1).not.toBe(id2);
    });

    it('should generate incrementing IDs when called rapidly', () => {
      const ids = Array.from({ length: 10 }, () => generateSnowflake());
      
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i]).toBeGreaterThan(ids[i - 1]);
      }
    });

    it('should handle timestamp collision correctly', () => {
      const originalDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(1234567890);
      
      const id1 = generateSnowflake();
      const id2 = generateSnowflake();
      
      expect(id2).toBeGreaterThan(id1);
      
      Date.now = originalDateNow;
    });
  });
});