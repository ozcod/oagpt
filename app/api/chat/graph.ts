import { MessagesState } from "./state";
import { SystemMessage } from "@langchain/core/messages";
import { GraphNode, START, END, StateGraph } from "@langchain/langgraph/web";
import { getDynamicModel } from "./model";

const llmCall: GraphNode<typeof MessagesState> = async (state) => {
  const model = getDynamicModel("gemini-2.5-flash");
  const response = await model.invoke([
    new SystemMessage("You are a helpful assistant"),
    ...state.messages,
  ]);
  return {
    messages: [response],
  };
};

export const agent = new StateGraph(MessagesState)
  .addNode("callLLM", llmCall)
  .addEdge(START, "callLLM")
  .addEdge("callLLM", END)
  .compile();
