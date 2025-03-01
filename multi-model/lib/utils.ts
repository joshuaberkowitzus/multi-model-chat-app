import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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