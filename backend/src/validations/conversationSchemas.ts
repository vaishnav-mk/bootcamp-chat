import { z } from 'zod';
import { ConversationType } from '../constants/enums';

export const createConversationSchema = z.object({
  type: z.nativeEnum(ConversationType),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  member_ids: z.array(z.string().min(1, 'Member ID is required')).min(0, 'Member IDs array is required'),
});

export type CreateConversationData = z.infer<typeof createConversationSchema>;