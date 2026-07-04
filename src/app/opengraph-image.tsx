import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoData = await readFile(join(process.cwd(), "public/images/logo-navy.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f3ec",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 1040,
            height: 486,
            border: "3px solid #16223a",
            boxShadow: "14px 14px 0 rgba(22,34,58,0.15)",
            background: "#ffffff",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={140} height={140} alt="" />
          <div
            style={{
              marginTop: 28,
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#16223a",
            }}
          >
            Faruk Gürbüz
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 26,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1b87b8",
            }}
          >
            Personal Atlas
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
