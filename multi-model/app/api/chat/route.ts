import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { jsonSchema, streamText } from "ai";
import {useUsageStore} from "@/lib/utils";

export const maxDuration = 90;

const modelProviders = {
  openai,
  anthropic,
};

export async function POST(req: Request) {
  // Extract request body
  const body = await req.json();
  console.log("Request body keys:", Object.keys(body));
  
  const { messages, system, tools, modelConfig } = body;
  
  // Get model settings from the modelConfig field or use defaults
  const modelName = modelConfig?.modelName || "claude-3-opus-20240229";
  const modelOwner = modelConfig?.modelOwner || "anthropic";
  
  console.log(`Using model: ${modelName} from provider: ${modelOwner}`);
  console.log("Full request body:", JSON.stringify(body, null, 2));

  // Get the appropriate model provider
  const modelProvider = modelProviders[modelOwner as keyof typeof modelProviders];
  if (!modelProvider) {
    throw new Error(`Unsupported model owner: ${modelOwner}`);
  }

  // Initialize the selected model
  const model = modelProvider(modelName);
  console.log("Model initialized:", model);

  const result = streamText({
    model,
    messages,
    system,
    tools: Object.fromEntries(
      Object.keys(tools).map((name) => [
        name,
        { ...tools[name], parameters: jsonSchema(tools[name].parameters) },
      ])
    ),
  });

  return result.toDataStreamResponse({
    sendUsage: true,
    sendReasoning: true,
    sendSources: true
  });

}
