import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0A0A0F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, #6366F1 0%, transparent 70%)",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            background: "linear-gradient(90deg, #6366F1, #A855F7)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 16,
          }}
        >
          JusticeAI
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#A1A1AA",
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          AI-powered legal analysis and code review for lawyers, engineers, and
          everyone.
        </div>
      </div>
    ),
    { ...size },
  );
}
