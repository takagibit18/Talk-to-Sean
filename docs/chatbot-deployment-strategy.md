# Chatbot Deployment Strategy

This document records the planned product and deployment split for the personal homepage and the `Talk-to-Sean` chatbot. The v2 runtime now implements the overseas chatbot service directly in this repo; domestic static hosting can still use a separate static build if needed.

## Decision

The chatbot should be treated as two related product shapes instead of one universal deployment:

1. **Domestic entry**: a stable, filed domain for the personal homepage in mainland China, with a clear jump point to the chatbot.
2. **Overseas chatbot service**: a Vercel-hosted experience where the chatbot can be built into the page and the site owner provides the model API through a server-side endpoint.

This split keeps the domestic homepage reliable and compliant while avoiding a weak chatbot experience for users who cannot access the required network or model API path. It also keeps the overseas version product-like: visitors can click and chat without understanding API keys, proxy setup, or model billing.

## Domestic Entry

The domestic product shape is:

```text
User
  -> ICP / public-security filed domain
  -> mainland-accessible static homepage
  -> Talk to Sean button
  -> overseas chatbot URL
```

The domestic homepage should be hosted as a static site, for example Alibaba Cloud OSS + CDN, and should continue to show filing information where required. Its job is to present Sean's profile, projects, CV, and contact channels reliably.

The chatbot entry can link to a Vercel-hosted chatbot page through `NEXT_PUBLIC_TALK_TO_SEAN_URL`. If a visitor cannot access Vercel or the model provider path, the site does not need to provide a domestic model proxy. That boundary is reasonable for this product: the chatbot is aimed at developers and AI-native visitors, and users who cannot operate the needed network/API environment are not the primary audience for the chatbot service.

## Overseas Chatbot Service

The overseas product shape is:

```text
User browser
  -> Vercel page / embedded chatbot UI
  -> /api/chat server-side endpoint
  -> model provider API
```

For the best user experience, the overseas version should provide the API/token from the site owner side. Visitors should not need to paste their own key for the primary flow.

The API key must stay server-side, for example in Vercel environment variables. The browser should call only the application's own endpoint, such as `/api/chat`. The endpoint then calls the model provider and returns a scoped answer.

The chatbot should be scoped as a profile assistant, not a general-purpose free LLM proxy. It should answer questions about Sean, projects, technical background, contact paths, and related portfolio material.

## API Ownership

The default ownership model is:

- **Primary flow**: Sean provides API/token through the deployed server-side chatbot service.
- **Fallback flow**: BYOK is optional for self-hosting, local development, or when the public demo quota is exhausted.
- **Not recommended**: making BYOK the first thing a homepage visitor sees.

Providing the API from the site owner side is technically feasible and creates a much better product experience. The main implementation risk is not API integration itself; it is cost control and abuse prevention.

## Security And Cost Controls

The overseas chatbot service should include these controls before public launch:

- Store model API keys only in server-side environment variables.
- Add rate limits by IP and by anonymous session.
- Add a daily or monthly owner-side budget cap.
- Limit input length and retained chat history.
- Use a cost-aware default model.
- Restrict answers to Sean/profile/project topics.
- Reject unrelated heavy tasks such as essay writing, generic coding help, or bulk generation.
- Return a clear quota-exhausted state when limits are reached.
- Log request counts, token usage, limit hits, and model errors without storing sensitive user content unnecessarily.

If quota is exhausted, the UI can show a message such as:

```text
The public demo quota is used up for now. Developers can self-host the chatbot or use their own API key from the GitHub project.
```

It should not silently become an unlimited proxy.

## Migration Notes For This Repo

The earlier homepage used static export:

```ts
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};
```

This mode is appropriate only for a domestic static homepage and for a button that links to a separate chatbot deployment. It is not enough for the v2 runtime because a safe owner-provided API requires a server-side runtime.

There are two viable implementation paths:

1. **Keep this repo static** and implement the full chatbot in the separate `Talk-to-Sean` Vercel project. This is the preferred first implementation because it preserves the current domestic static deployment.
2. **Create an overseas runtime variant** of the homepage on Vercel by removing or bypassing pure static export and adding an `/api/chat` endpoint. This is useful only if the chatbot must be embedded directly in the homepage rather than opened as a separate page.

The existing `NEXT_PUBLIC_TALK_TO_SEAN_URL` setting should remain the integration point for the domestic homepage. When the overseas chatbot URL is ready, configure that variable for builds that should show the chatbot CTA.
