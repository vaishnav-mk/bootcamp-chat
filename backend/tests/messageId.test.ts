import { generateSnowflake } from '../src/utils/snowflake';

describe('Message ID Generation', () => {
  describe('generateSnowflake for messages', () => {
    it('should generate valid message IDs in sequence', () => {
      const messageIds = [];
      
      // Generate multiple message IDs quickly
      for (let i = 0; i < 5; i++) {
        messageIds.push(generateSnowflake());
      }
      
      // All should be unique
      const uniqueIds = new Set(messageIds);
      expect(uniqueIds.size).toBe(5);
      
      // All should be incrementing
      for (let i = 1; i < messageIds.length; i++) {
        expect(messageIds[i]).toBeGreaterThan(messageIds[i - 1]);
      }
    });

    it('should handle high-frequency message creation', () => {
      const messageIds = [];
      
      // Simulate rapid message creation
      for (let i = 0; i < 100; i++) {
        messageIds.push(generateSnowflake());
      }
      
      // Should all be unique even at high frequency
      const uniqueIds = new Set(messageIds);
      expect(uniqueIds.size).toBe(100);
    });

    it('should generate IDs that can be converted to string for API responses', () => {
      const messageId = generateSnowflake();
      const messageIdString = messageId.toString();
      
      expect(typeof messageIdString).toBe('string');
      expect(messageIdString.length).toBeGreaterThan(0);
      expect(BigInt(messageIdString)).toBe(messageId);
    });
  });
});