import { isApiHttpError } from '../apiClient.js';

interface TextContent {
  type: 'text';
  text: string;
}

interface ToolResponse {
  [key: string]: unknown;
  content: TextContent[];
  isError?: true;
}

export function toolSuccess(text: string): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

function formatToolError(error: unknown): string {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  if (isApiHttpError(error)) {
    const body =
      typeof error.responseBody === 'string'
        ? error.responseBody
        : JSON.stringify(error.responseBody);
    return `${error.message}\nstatus=${error.status}\nbody=${body}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export function toolFailure(prefix: string, error: unknown): ToolResponse {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: `${prefix}: ${formatToolError(error)}`,
      },
    ],
  };
}
