import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { create } from 'zustand'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}



/////////////////////////////USAGE DATA STORE
import { UsageData } from "@/components/assistant-ui/usage-info";
/*
export type UsageData = {
    //message_id?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    modelName?: string;
    modelOwner?: string;
};
*/

interface UsageState {
  usageHistory: {
    messageId: string;
    usage: UsageData;
  }[];

  messageOrder: string[];  // Track order of messages as they appear
  addMessageUsage: (messageId: string, usage: UsageData) => void;
  getUsageByMessageId: (messageId: string) => UsageData | undefined;
  addMessageToOrder: (messageId: string) => void;
  getMessagePosition: (messageId: string) => number;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  usageHistory: [],
  messageOrder: [], // Maintains order of messages as they appear

  addMessageToOrder: (messageId: string) => {
    set((state) => ({
      messageOrder: [...state.messageOrder, messageId]
    }));
  },

  getMessagePosition: (messageId: string) => {
    return get().messageOrder.indexOf(messageId);
  },

  addMessageUsage: (messageId: string, usage: UsageData) => {
    console.log(`Adding usage for message ${messageId}:`, usage);
    set((state) => {
      // Only add if not already present
      if (!state.usageHistory.find(m => m.messageId === messageId)) {
        return {
          usageHistory: [...state.usageHistory, { messageId, usage }]
        };
      }
      return state;
    });
  },

  getUsageByMessageId: (messageId: string) => {
    const entry = get().usageHistory.find(m => m.messageId === messageId);
    return entry?.usage;
  }
}));
//////////////////////////////////////////////MODEL CONFIGURATION
// Model configuration
export type ModelConfig = {
    modelName: string;
    modelOwner: string;
    displayName?: string;
};

// Define available model providers and their models
export const modelProviders = {
    openai: {
        name: "OpenAI",
        models: [
            { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
            { id: "gpt-4", name: "GPT-4" },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
            { id: "gpt-4o", name: "GPT-4o" }
        ],
        defaultModel: "gpt-3.5-turbo"
    },
    anthropic: {
        name: "Anthropic",
        models: [
            { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
            { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
            { id: "claude-3-opus-20240229", name: "Claude 3 Opus" }
        ],
        defaultModel: "claude-3-haiku-20240307"
    },
    mistral: {
        name: "Mistral AI",
        models: [
            { id: "mistral-tiny", name: "Mistral Tiny" },
            { id: "mistral-small", name: "Mistral Small" },
            { id: "mistral-medium", name: "Mistral Medium" },
            { id: "mistral-large", name: "Mistral Large" }
        ],
        defaultModel: "mistral-small"
    },
    cohere: {
        name: "Cohere",
        models: [
            { id: "command", name: "Command" },
            { id: "command-light", name: "Command Light" },
            { id: "command-r", name: "Command R" },
            { id: "command-r-plus", name: "Command R+" }
        ],
        defaultModel: "command"
    }
};

// Get the default model for a provider
export function getDefaultModelForProvider(providerKey: string): string {
    return modelProviders[providerKey as keyof typeof modelProviders]?.defaultModel || "gpt-3.5-turbo";
}