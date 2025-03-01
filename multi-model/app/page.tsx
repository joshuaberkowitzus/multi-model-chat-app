"use client";
import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { useRef, useEffect } from "react";

export default function Home() {
  // Reference to store model configuration
  const modelConfigRef = useRef({
    modelName: "gpt-3.5-turbo",
    modelOwner: "openai"
  });

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
