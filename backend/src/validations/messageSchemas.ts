import { z } from "zod";

export const createMessageSchema = z.object({
  conversation_id: z.string().min(1),
  content: z.string().min(1).max(2000),
  message_type: z.string().optional().default("text"),
  metadata: z.any().optional(),
  parent_id: z.string().optional(),
});

export const editMessageSchema = z.object({
  message_id: z.string().min(1),
  content: z.string().min(1).max(2000),
  metadata: z.any().optional(),
});

export const deleteMessageSchema = z.object({
  message_id: z.string().min(1),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;