"use client";
import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { useRef, useEffect } from "react";
import { useUsageStore } from "@/lib/utils";


export default function Home() {
  // Reference to store model configuration
  const modelConfigRef = useRef({
    modelName: "gpt-3.5-turbo",
    modelOwner: "openai"
  });

  
/////////////////////////////////////USAGE DATA STORE
  const runtime = useChatRuntime({ 
    api: "/api/chat",
    onResponse: async (response) => {
      console.log("API response received:", response.status);
      if (!response.ok) {
        console.error("API error:", response.statusText);
        return;
      }

      const responseCopy = response.clone();

      const reader = responseCopy.body?.getReader();
      if (!reader) return;
      let messageID = null;


      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n').filter(line => line.trim());

          for (const line of lines) {
            // Handle message ID lines (f: prefix)
            if (line.startsWith('f:')) {
              try {
                const parsed = JSON.parse(line.substring(2));
                messageID = parsed.messageId;
                console.log("Found message ID:", messageID);
                // Add to message order
                useUsageStore.getState().addMessageToOrder(messageID);
              } catch (e) {
                console.error("Error parsing message ID:", e);
              }
              continue;
            }
            
            // Handle usage data lines (e: or d: prefix)
            if ((line.startsWith('e:') || line.startsWith('d:')) && messageID) {
              try {
                const data = JSON.parse(line.substring(2));
                if (data.usage) {
                  // Add to usage history with current message ID
                  useUsageStore.getState().addMessageUsage(messageID, {
                    promptTokens: data.usage.promptTokens || 0,
                    completionTokens: data.usage.completionTokens || 0,
                    totalTokens: (data.usage.promptTokens || 0) + (data.usage.completionTokens || 0),
                    modelName: modelConfigRef.current.modelName,    // Add model info from config
                    modelOwner: modelConfigRef.current.modelOwner
                  });
                  console.log(`Added usage data for message ${messageID}`);
                  console.log("Current usage data:", useUsageStore.getState().usageHistory);
                }
              } catch (e) {
                console.error("Error processing usage data:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error processing stream:", error);
      } finally {
        reader.releaseLock();
      }
    },
    body: {
      get modelConfig() {
        return modelConfigRef.current;
      }
    },
  });

  // Make runtime and config accessible between components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__ASSISTANT_UI_RUNTIME__ = runtime;
      (window as any).__MODEL_CONFIG_REF__ = modelConfigRef;
    }
  }, [runtime]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="h-dvh grid grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
        <ThreadList />
        <Thread />
      </main>
    </AssistantRuntimeProvider>
  );
}
