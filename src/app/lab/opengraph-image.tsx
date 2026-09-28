import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Hydrology Lab — interactive lessons on watersheds and dam flood routing";

// A reservoir-routing sketch: the inflow flood and the lower, later outflow.
function hydrograph(peak: number, tp: number, n = 60, w = 460, h = 250) {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 5;
    const q = peak * Math.pow(t / tp, 2.4) * Math.exp(-2.4 * (t / tp - 1));
    pts.push(`${((i / n) * w).toFixed(1)},${(h - q * h).toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function LabOpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f6f3ec", fontFamily: "sans-serif", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            width: 1080,
            height: 510,
            border: "3px solid #16223a",
            boxShadow: "14px 14px 0 rgba(22,34,58,0.15)",
            background: "#ffffff",
            padding: "56px 60px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 520 }}>
            <div style={{ fontSize: 22, letterSpacing: "0.16em", color: "#1b87b8", textTransform: "uppercase" }}>Free interactive lessons</div>
            <div style={{ marginTop: 16, fontSize: 64, fontWeight: 700, color: "#16223a", lineHeight: 1.05 }}>Hydrology Lab</div>
            <div style={{ marginTop: 22, fontSize: 28, color: "#3a4459", lineHeight: 1.35 }}>
              Watershed delineation · D8 flow · Rational Method · Dam flood routing
            </div>
            <div style={{ marginTop: 30, fontSize: 24, color: "#16223a" }}>farukgurbuz.com/lab</div>
          </div>
          <svg width="460" height="270" viewBox="0 -10 460 270">
            <line x1="0" y1="250" x2="460" y2="250" stroke="#8a93a6" strokeWidth="2" />
            <polyline points={hydrograph(1, 1)} fill="none" stroke="#2a78d6" strokeWidth="6" />
            <polyline points={hydrograph(0.42, 2.2)} fill="none" stroke="#eb6834" strokeWidth="6" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
