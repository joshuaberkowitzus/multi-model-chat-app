import { FC } from 'react';

export interface UsageData {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  modelName?: string;
  modelOwner?: string;
}

interface UsageInfoProps {
  usage?: UsageData;
}

export const UsageInfo: FC<UsageInfoProps> = ({ usage }) => {
  if (!usage) return null;
  
  return (
    <div className="text-xs text-muted-foreground mt-2">
      {usage.promptTokens !== undefined && (
        <span className="mr-2">Prompt: {usage.promptTokens}</span>
      )}
      {usage.completionTokens !== undefined && (
        <span className="mr-2">Completion: {usage.completionTokens}</span>
      )}
      {usage.totalTokens !== undefined && (
        <span className="mr-2">Total: {usage.totalTokens}</span>
      )}
      {usage.modelName !== undefined && (
        <span className="mr-2">Model: {usage.modelName}</span>
      )}
      {usage.modelOwner !== undefined && (
        <span className="mr-2">Owner: {usage.modelOwner}</span>
      )}
    </div>
  );
};