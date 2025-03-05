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

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            // Look specifically for lines starting with 'e:' or 'd:' containing usage data
            if (line.startsWith('e:') || line.startsWith('d:')) {
              try {
                const jsonStr = line.substring(2); // Remove prefix
                const data = JSON.parse(jsonStr);
                
                if (data.usage) {
                  console.log("Found usage data:", data.usage);
                  const totalUsage = {
                    promptTokens: data.usage.promptTokens || 0,
                    completionTokens: data.usage.completionTokens || 0,
                    totalTokens: (data.usage.promptTokens || 0) + (data.usage.completionTokens || 0)
                  };
                  useUsageStore.getState().setUsage(totalUsage);
                }
              } catch (e) {
                console.error("Error parsing usage data:", e);
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

  /*
  // Setup the chat runtime
  const runtime = useChatRuntime({ 
    api: "/api/chat",
    // Make runtime accessible via window for debugging
    onResponse: (response) => {
      console.log("API response received:", response.status);
      if (!response.ok) {
        console.error("API error:", response.statusText);
      }
    },
    // Customize the request to include model settings
    body: {
      get modelConfig() {
        // This will be evaluated when the request is made
        return modelConfigRef.current;
      }
    },
  });
  */
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
