import * as authSchema from "./auth-schema";
import * as chatSchema from "./chat-schema";

export const schema = {
  ...authSchema.schema,
  chatThread: chatSchema.chatThread,
  chatMessage: chatSchema.chatMessage,
  generatedImage: chatSchema.generatedImage,
};

export * from "./auth-schema";
export * from "./chat-schema";
