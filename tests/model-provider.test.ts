import { getChatModel, getModelConfig } from "@/lib/model-provider";

describe("model provider config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reads explicit API key, model, and OpenAI-compatible base URL", () => {
    process.env.OPENAI_API_KEY = "sk-test-key";
    process.env.OPENAI_MODEL = "deepseek-chat";
    process.env.BASEURL = "https://api.deepseek.com/v1";

    expect(getModelConfig()).toEqual({
      apiKey: "sk-test-key",
      baseURL: "https://api.deepseek.com/v1",
      modelName: "deepseek-chat"
    });
  });

  it("prefers OPENAI_BASE_URL over BASEURL when both are set", () => {
    process.env.OPENAI_API_KEY = "sk-test-key";
    process.env.OPENAI_BASE_URL = "https://openai-compatible.example/v1";
    process.env.BASEURL = "https://api.deepseek.com/v1";

    expect(getModelConfig().baseURL).toBe(
      "https://openai-compatible.example/v1"
    );
  });

  it("throws a clear error when OPENAI_API_KEY is missing", () => {
    delete process.env.OPENAI_API_KEY;

    expect(() => getModelConfig()).toThrow("OPENAI_API_KEY is not configured.");
  });

  it("uses the OpenAI default base URL when the base URL env var is blank", () => {
    process.env.OPENAI_API_KEY = "sk-test-key";
    process.env.OPENAI_BASE_URL = "";
    delete process.env.BASEURL;

    expect(getModelConfig().baseURL).toBe("https://api.openai.com/v1");
  });

  it("rejects relative OpenAI-compatible base URLs before provider calls", () => {
    process.env.OPENAI_API_KEY = "sk-test-key";
    process.env.OPENAI_BASE_URL = "/api/openai";
    delete process.env.BASEURL;

    expect(() => getModelConfig()).toThrow(
      "OPENAI_BASE_URL must be an absolute http(s) URL."
    );
  });

  it("uses the OpenAI-compatible chat completions model instead of Responses API", () => {
    process.env.OPENAI_API_KEY = "sk-test-key";
    process.env.OPENAI_MODEL = "deepseek-v4-pro";
    process.env.OPENAI_BASE_URL = "https://api.deepseek.com";

    expect(getChatModel().provider).toBe("openai.chat");
  });
});
