import { z } from 'zod';

export const createConversationSchema = z.object({
  type: z.enum(['direct', 'group']),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  member_ids: z.array(z.string().min(1, 'Member ID is required')).min(1, 'At least one member is required'),
});

export type CreateConversationData = z.infer<typeof createConversationSchema>;