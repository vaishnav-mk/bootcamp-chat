import messageCreate from "./messageCreate";
import messageEdit from "./messageEdit";
import messageDelete from "./messageDelete";
import joinConversations from "./joinConversations";

const handlers = [
  messageCreate,
  messageEdit,
  messageDelete,
  joinConversations
];

export default handlers;