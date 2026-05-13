import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sean Yu - Agent / LLM Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b09",
          color: "#f4ead8",
          padding: "72px",
          fontFamily: "Arial",
        }}
      >
        <div style={{ fontSize: 28, color: "#e1bd68", letterSpacing: 4 }}>
          TALK TO SEAN
        </div>
        <div>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1 }}>Sean Yu</div>
          <div style={{ marginTop: 24, fontSize: 36, color: "#d8cfbe" }}>
            Agent / RAG / LLM systems
          </div>
        </div>
        <div style={{ fontSize: 28, color: "#a39b8b" }}>
          Evaluable LLM products, backend services, and open-source engineering.
        </div>
      </div>
    ),
    size,
  );
}
