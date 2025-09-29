import { 
  createMessageSchema, 
  editMessageSchema, 
  messageParamsSchema,
  conversationParamsSchema 
} from '../src/validations/messageSchemas';

describe('Message Schemas', () => {
  describe('createMessageSchema', () => {
    it('should validate valid message creation data', () => {
      const validData = {
        conversation_id: '123456789',
        content: 'Hello, world!',
        message_type: 'text'
      };

      const result = createMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid message creation data', () => {
      const invalidData = {
        conversation_id: '',
        content: '',
        message_type: 'text'
      };

      const result = createMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should apply default message_type', () => {
      const validData = {
        conversation_id: '123456789',
        content: 'Hello, world!'
      };

      const result = createMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message_type).toBe('text');
      }
    });
  });

  describe('editMessageSchema', () => {
    it('should validate valid message edit data', () => {
      const validData = {
        content: 'Updated message content'
      };

      const result = editMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = {
        content: ''
      };

      const result = editMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('messageParamsSchema', () => {
    it('should validate valid message ID parameter', () => {
      const validData = {
        messageId: '123456789'
      };

      const result = messageParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty message ID', () => {
      const invalidData = {
        messageId: ''
      };

      const result = messageParamsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('conversationParamsSchema', () => {
    it('should validate valid conversation ID parameter', () => {
      const validData = {
        conversationId: '123456789'
      };

      const result = conversationParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty conversation ID', () => {
      const invalidData = {
        conversationId: ''
      };

      const result = conversationParamsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});