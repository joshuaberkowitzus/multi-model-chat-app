import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Add model configuration to chat requests
export function addModelConfigMiddleware(event: FormEvent, modelConfig: { modelName: string, modelOwner: string }) {
    // Prevent the default form submission
    event.preventDefault();
    
    // Access the runtime from the window
    const runtime = (window as any).__ASSISTANT_UI_RUNTIME__;
    if (!runtime) return;
    
    // Get the text from the form
    const form = event.target as HTMLFormElement;
    const inputElement = form.querySelector('textarea[name="input"]') as HTMLTextAreaElement;
    const text = inputElement?.value || '';
    
    // Use the runtime's submit method with the model configuration
    runtime.submit({
        text,
        extra: {
            modelName: modelConfig.modelName,
            modelOwner: modelConfig.modelOwner
        }
    });
}