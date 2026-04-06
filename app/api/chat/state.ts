import { StateSchema, MessagesValue } from "@langchain/langgraph";
import { z } from "zod/v4";

export const MessagesState = new StateSchema({
  messages: MessagesValue,
});
