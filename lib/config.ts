import { z } from "zod";

export const DEFAULT_OPENAI_MODEL = "gpt-5-mini";
export const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalTrimmedString = z.preprocess(
  blankToUndefined,
  z.string().trim().min(1).optional(),
);

const EnvSchemaBase = z.object({
  OPENAI_API_KEY: optionalTrimmedString,
  OPENAI_MODEL: z.preprocess(
    blankToUndefined,
    z.string().trim().min(1).default(DEFAULT_OPENAI_MODEL),
  ),
  OPENAI_BASE_URL: z.preprocess(
    blankToUndefined,
    z.string().trim().url({ message: "Invalid URL" }).default(DEFAULT_OPENAI_BASE_URL),
  ),
  GITHUB_USERNAME: optionalTrimmedString,
  GITHUB_PAT: optionalTrimmedString,
  ALLOWED_DEV_ORIGINS: z.preprocess(
    blankToUndefined,
    z.string().default(""),
  ).transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
  DAILY_REQUEST_LIMIT: z.preprocess(
    blankToUndefined,
    z.coerce.number().int().positive().default(100),
  ),
  DAILY_IP_LIMIT: z.preprocess(
    blankToUndefined,
    z.coerce.number().int().positive().default(20),
  ),
});

type EnvSchemaOptions = {
  requireOpenAIKey?: boolean;
  missingOpenAIKeyMessage?: string;
};

function makeEnvSchema(options: EnvSchemaOptions = {}) {
  const requireOpenAIKey = options.requireOpenAIKey ?? true;
  const missingOpenAIKeyMessage =
    options.missingOpenAIKeyMessage ?? "OPENAI_API_KEY is required";

  return EnvSchemaBase.superRefine((env, ctx) => {
    if (requireOpenAIKey && !env.OPENAI_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["OPENAI_API_KEY"],
        message: missingOpenAIKeyMessage,
      });
    }

    if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.startsWith("sk-")) {
      ctx.addIssue({
        code: "custom",
        path: ["OPENAI_API_KEY"],
        message: "OPENAI_API_KEY must start with sk-",
      });
    }

    if (!env.GITHUB_USERNAME) {
      ctx.addIssue({
        code: "custom",
        path: ["GITHUB_USERNAME"],
        message: "GITHUB_USERNAME is required",
      });
    }
  });
}

export type AppEnv = z.infer<typeof EnvSchemaBase> & {
  GITHUB_USERNAME: string;
  ALLOWED_DEV_ORIGINS: string[];
};

export type EnvValidationResult =
  | { success: true; env: AppEnv; errors: [] }
  | { success: false; env: null; errors: string[] };

export function getEnvValidationResult(
  input: NodeJS.ProcessEnv | Record<string, unknown> = process.env,
  options: EnvSchemaOptions = {},
): EnvValidationResult {
  const parsed = makeEnvSchema(options).safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      env: null,
      errors: Array.from(new Set(parsed.error.issues.map((issue) => issue.message))),
    };
  }

  return {
    success: true,
    env: parsed.data as AppEnv,
    errors: [],
  };
}

export function validateEnv(
  input: NodeJS.ProcessEnv | Record<string, unknown> = process.env,
  options: EnvSchemaOptions = {},
): AppEnv {
  const result = getEnvValidationResult(input, options);

  if (!result.success) {
    throw new Error(
      `Environment validation failed:\n${result.errors
        .map((error) => `- ${error}`)
        .join("\n")}`,
    );
  }

  return result.env;
}
