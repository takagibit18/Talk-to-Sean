export enum ChatErrorCode {
  MISSING_API_KEY = "MISSING_API_KEY",
  INVALID_BASE_URL = "INVALID_BASE_URL",
  MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE",
  RATE_LIMITED = "RATE_LIMITED",
  QUOTA_EXHAUSTED = "QUOTA_EXHAUSTED",
  INVALID_MESSAGE = "INVALID_MESSAGE",
  PROVIDER_TIMEOUT = "PROVIDER_TIMEOUT",
}

const ERROR_META: Record<
  ChatErrorCode,
  {
    status: number;
    message: string;
  }
> = {
  [ChatErrorCode.MISSING_API_KEY]: {
    status: 503,
    message: "Service not configured yet. Please contact the site owner.",
  },
  [ChatErrorCode.INVALID_BASE_URL]: {
    status: 503,
    message: "Model provider is misconfigured.",
  },
  [ChatErrorCode.MODEL_UNAVAILABLE]: {
    status: 502,
    message: "AI model is temporarily unavailable.",
  },
  [ChatErrorCode.RATE_LIMITED]: {
    status: 429,
    message: "Too many requests. Please wait a moment and try again.",
  },
  [ChatErrorCode.QUOTA_EXHAUSTED]: {
    status: 429,
    message: "Today's public quota is used up. Please try again tomorrow.",
  },
  [ChatErrorCode.INVALID_MESSAGE]: {
    status: 400,
    message: "Invalid chat request.",
  },
  [ChatErrorCode.PROVIDER_TIMEOUT]: {
    status: 504,
    message: "AI is taking too long. Please try again.",
  },
};

export class ChatError extends Error {
  readonly code: ChatErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ChatErrorCode, message?: string, details?: unknown) {
    super(message ?? ERROR_META[code].message);
    this.name = "ChatError";
    this.code = code;
    this.status = ERROR_META[code].status;
    this.details = details;
  }
}

export function getChatErrorResponse(error: ChatError) {
  return {
    status: error.status,
    body: {
      error: error.message,
      errorCode: error.code,
      details: error.details,
    },
  };
}

export function toChatError(error: unknown): ChatError {
  if (error instanceof ChatError) {
    return error;
  }

  return new ChatError(ChatErrorCode.MODEL_UNAVAILABLE);
}
