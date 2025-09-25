import { createConversationSchema } from '../src/validations/conversationSchemas';

describe('Conversation Validation Schemas', () => {
  describe('createConversationSchema', () => {
    it('should validate direct conversation data', () => {
      const validData = {
        type: 'direct' as const,
        member_ids: ['123', '456']
      };

      expect(() => createConversationSchema.parse(validData)).not.toThrow();
    });

    it('should validate group conversation data', () => {
      const validData = {
        type: 'group' as const,
        name: 'Test Group',
        member_ids: ['123', '456', '789']
      };

      expect(() => createConversationSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid conversation type', () => {
      const invalidData = {
        type: 'invalid',
        member_ids: ['123']
      };

      expect(() => createConversationSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty member_ids', () => {
      const invalidData = {
        type: 'direct' as const,
        member_ids: []
      };

      expect(() => createConversationSchema.parse(invalidData)).toThrow();
    });

    it('should allow group conversation without name', () => {
      const validData = {
        type: 'group' as const,
        member_ids: ['123', '456']
      };

      expect(() => createConversationSchema.parse(validData)).not.toThrow();
    });
  });
});