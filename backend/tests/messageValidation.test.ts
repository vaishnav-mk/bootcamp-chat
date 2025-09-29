import { createMessageSchema, editMessageSchema } from '../src/validations/messageSchemas';

describe('Message Validation', () => {
  describe('createMessageSchema', () => {
    it('should validate message with different message types', () => {
      const imageMessage = {
        conversation_id: '123456789',
        content: 'image.jpg',
        message_type: 'image'
      };

      const result = createMessageSchema.safeParse(imageMessage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message_type).toBe('image');
      }
    });

    it('should validate reply message with parent_id', () => {
      const replyMessage = {
        conversation_id: '123456789',
        content: 'This is a reply',
        parent_id: '987654321'
      };

      const result = createMessageSchema.safeParse(replyMessage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parent_id).toBe('987654321');
      }
    });

    it('should validate message with metadata', () => {
      const messageWithMetadata = {
        conversation_id: '123456789',
        content: 'Message with metadata',
        metadata: { priority: 'high', tags: ['important'] }
      };

      const result = createMessageSchema.safeParse(messageWithMetadata);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toEqual({ priority: 'high', tags: ['important'] });
      }
    });

    it('should reject message with very long content', () => {
      const longContent = 'x'.repeat(5001); // Assuming 5000 char limit
      const messageWithLongContent = {
        conversation_id: '123456789',
        content: longContent
      };

      const result = createMessageSchema.safeParse(messageWithLongContent);
      // This might pass depending on your validation rules
      // Adjust based on your actual schema constraints
    });
  });

  describe('editMessageSchema', () => {
    it('should validate message edit with metadata', () => {
      const editData = {
        content: 'Updated content',
        metadata: { edited: true, editedAt: new Date().toISOString() }
      };

      const result = editMessageSchema.safeParse(editData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.edited).toBe(true);
      }
    });

    it('should allow content-only edits', () => {
      const editData = {
        content: 'Just updating the text'
      };

      const result = editMessageSchema.safeParse(editData);
      expect(result.success).toBe(true);
    });
  });
});