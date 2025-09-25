import { User, Conversation, Message, ConversationMember } from '../src/types/interfaces';

describe('Interface Types', () => {
  it('should define User interface correctly', () => {
    const user: User = {
      id: 123n,
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      username: 'testuser',
      name: 'Test User',
      avatarPath: '/path/to/avatar.jpg',
      status: 'online',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(user.id).toBe(123n);
    expect(user.email).toBe('test@example.com');
    expect(typeof user.passwordHash).toBe('string');
  });

  it('should define Conversation interface correctly', () => {
    const conversation: Conversation = {
      id: 456n,
      type: 'group',
      name: 'Test Group',
      createdBy: 123n,
      createdAt: new Date()
    };

    expect(conversation.id).toBe(456n);
    expect(conversation.type).toBe('group');
    expect(conversation.createdBy).toBe(123n);
  });

  it('should define Message interface correctly', () => {
    const message: Message = {
      id: 789n,
      conversationId: 456n,
      senderId: 123n,
      content: 'Hello world!',
      messageType: 'text',
      createdAt: new Date()
    };

    expect(message.id).toBe(789n);
    expect(message.content).toBe('Hello world!');
    expect(message.messageType).toBe('text');
  });

  it('should define ConversationMember interface correctly', () => {
    const member: ConversationMember = {
      id: 999n,
      conversationId: 456n,
      userId: 123n,
      role: 'member',
      joinedAt: new Date()
    };

    expect(member.conversationId).toBe(456n);
    expect(member.userId).toBe(123n);
    expect(member.role).toBe('member');
  });
});