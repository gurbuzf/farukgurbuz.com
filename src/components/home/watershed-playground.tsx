"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useAtlas } from "@/lib/atlas-provider";
import { copy, t } from "@/content/copy";
import {
  computeD8,
  computeFlowAccumulation,
  traceDrainagePath,
  findUpstreamCells,
  DIR_ARROW,
  DIR_VECTOR,
  type Direction,
} from "@/lib/watershed";
import {
  Play,
  Pause,
  Activity,
  Waves,
  Compass,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  GripHorizontal,
  RotateCcw,
  Calculator,
  Droplets,
  Timer,
  TrendingUp,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Dendritic River Network DEM — 15 cols × 12 rows (180 cells total)
// Topographic Characteristics:
// - Two distinct neighboring catchments incised with branching tributary valleys:
//   * West Basin (83 cells): Northwest & Northeast tributary branches converge at
//     row 5, col 2 into a deep main channel draining to Edge Outlet [11, 3] (Lake A, 6m).
//   * East Basin (97 cells): North & East tributary branches converge at
//     row 6, col 11 into a deep main channel draining to Edge Outlet [11, 12] (Bay B, 8m).
// - Both pour points are strictly located on the bottom raster EDGE (row 11).
// - True topographical Drainage Divide (Su Ayrım Çizgisi) separates the two catchments.
// - Designated Water Surface cells (Lake A and Coastal Bay B).
// ---------------------------------------------------------------------------
const DEM: number[][] = [
  [410, 435, 450, 465, 478, 492, 498, 485, 470, 455, 440, 430, 445, 460, 440],
  [385, 395, 415, 438, 452, 470, 482, 468, 445, 418, 405, 398, 412, 435, 415],
  [355, 345, 375, 405, 420, 445, 460, 446, 415, 372, 365, 360, 375, 405, 385],
  [320, 290, 330, 365, 385, 415, 435, 420, 380, 325, 320, 315, 335, 370, 350],
  [280, 235, 275, 320, 255, 380, 405, 390, 340, 270, 275, 265, 290, 330, 310],
  [240, 195, 180, 235, 220, 340, 370, 355, 295, 225, 215, 218, 245, 285, 265],
  [195, 155, 130, 185, 205, 295, 330, 315, 250, 185, 175, 165, 195, 235, 215],
  [150, 115,  90, 140, 175, 245, 285, 270, 205, 145, 130, 120, 145, 185, 165],
  [110,  80,  68,  60, 125, 190, 235, 220, 160, 108,  92,  80,  95, 135, 118],
  [ 75,  52,  44,  36,  78, 135, 180, 168, 118,  75,  62,  50,  55,  85,  75],
  // Receiving coastal bay and terminal lake water bodies at sea level datum (0 m)
  [ 45,  30,   0,   0,  28,  82, 125, 115,  78,  48,  32,   0,   0,  48,  42],
  [ 28,  18,   0,   0,   0,  45,  75,  68,  42,  28,  14,   0,   0,   0,  22],
];

const ROWS = DEM.length; // 12
const COLS = DEM[0].length; // 15
const TOTAL_CELLS = ROWS * COLS; // 180

// Coordinates in internal SVG coordinate space
const CELL_W = 56;
const CELL_H = 40;
const SVG_W = COLS * CELL_W; // 840
const SVG_H = ROWS * CELL_H; // 480

// Designated permanent water surface pixels (Receiving lake and bay water bodies at sea level 0 m)
const WATER_CELLS = new Set([
  // Lake A (West basin receiving lake at edge, 0 m)
  "10,2", "10,3",
  "11,2", "11,3", "11,4",
  // Coastal Bay B (East basin receiving coastal sea bay at edge, 0 m)
  "10,11", "10,12",
  "11,11", "11,12", "11,13",
]);

// Edge outlets for the two neighboring catchments (Sea level 0 m datum)
const WEST_OUTLET: [number, number] = [11, 3];
const EAST_OUTLET: [number, number] = [11, 12];

export type ViewMode = "dem" | "d8" | "acc";

// Key seed points alternating across neighboring catchments for auto-simulation
const RAINSTORM_SEEDS: [number, number][] = [
  [0, 1],   // West Basin ridge
  [0, 12],  // East Basin ridge
  [3, 1],   // West Basin north tributary
  [4, 4],   // West Basin east tributary
  [3, 9],   // East Basin north tributary
  [3, 13],  // East Basin east tributary
  [5, 2],   // West Basin confluence
  [6, 11],  // East Basin confluence
  [11, 3],  // West Edge Pour Point (Lake A, 0m)
  [11, 12], // East Edge Pour Point (Bay B, 0m)
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(t: number, a: number, b: number) {
  return a + (b - a) * t;
}

function lerpColour(t: number, ...stops: string[]): string {
  const n = stops.length - 1;
  const s = Math.max(0, Math.min(1, t)) * n;
  const i = Math.min(Math.floor(s), n - 1);
  const f = s - i;
  const [r1, g1, b1] = hexToRgb(stops[i]);
  const [r2, g2, b2] = hexToRgb(stops[i + 1]);
  return `rgb(${Math.round(lerp(f, r1, r2))},${Math.round(lerp(f, g1, g2))},${Math.round(lerp(f, b1, b2))})`;
}

const MIN_E = 0; // Sea level datum (0 m)
const MAX_E = 498;

const DEM_STOPS = ["#7ec5e3", "#a0d892", "#dfc584", "#f5ebd5"] as const;
const ACC_STOPS = ["#f8fafc", "#bae6fd", "#38bdf8", "#0284c7", "#0c4a6e"] as const;

function getElevColor(elev: number, isWater: boolean): string {
  if (isWater) {
    return "#38bdf8"; // Vibrant water blue for 0m sea level pixels
  }
  return lerpColour((elev - MIN_E) / (MAX_E - MIN_E), ...DEM_STOPS);
}

function getAccColor(val: number, maxVal: number, isWater: boolean): string {
  const t = maxVal > 1 ? Math.log(Math.max(1, val)) / Math.log(maxVal) : 0;
  if (isWater && val < 5) {
    return "#7dd3fc";
  }
  return lerpColour(t, ...ACC_STOPS);
}

function getElevTextColor(elev: number, isWater: boolean): string {
  if (isWater) return "#0c4a6e";
  return elev < 180 ? "#0f2f5c" : "#1e293b";
}

function getAccTextColor(
  val: number,
  maxVal: number,
  isDivide: boolean = false,
  isCatchment: boolean = false
): string {
  if (isDivide) return "#0f172a";
  if (isCatchment && val < 35) return "#0f172a";
  // Main river channels (val >= 35) have dark navy backgrounds where white text has high contrast
  // Low and mid accumulation cells (< 35) have light/medium sky-blue backgrounds and require dark text
  return val >= 35 ? "#ffffff" : "#0f172a";
}

// Hydro-enforces flat water bodies so water directs to edge pour points
function computeHydrologicalD8(
  dem: number[][],
  waterCells: Set<string>,
  westOutlet: [number, number],
  eastOutlet: [number, number]
): Direction[][] {
  const baseD8 = computeD8(dem);
  for (const key of waterCells) {
    const [r, c] = key.split(",").map(Number);
    if (r === westOutlet[0] && c === westOutlet[1]) {
      baseD8[r][c] = "SINK";
    } else if (r === eastOutlet[0] && c === eastOutlet[1]) {
      baseD8[r][c] = "SINK";
    } else if (c <= 5) {
      const dr = westOutlet[0] - r;
      const dc = westOutlet[1] - c;
      if (dr > 0 && dc === 0) baseD8[r][c] = "S";
      else if (dr > 0 && dc > 0) baseD8[r][c] = "SE";
      else if (dr > 0 && dc < 0) baseD8[r][c] = "SW";
      else if (dr === 0 && dc > 0) baseD8[r][c] = "E";
      else if (dr === 0 && dc < 0) baseD8[r][c] = "W";
    } else {
      const dr = eastOutlet[0] - r;
      const dc = eastOutlet[1] - c;
      if (dr > 0 && dc === 0) baseD8[r][c] = "S";
      else if (dr > 0 && dc > 0) baseD8[r][c] = "SE";
      else if (dr > 0 && dc < 0) baseD8[r][c] = "SW";
      else if (dr === 0 && dc > 0) baseD8[r][c] = "E";
      else if (dr === 0 && dc < 0) baseD8[r][c] = "W";
    }
  }
  return baseD8;
}

function D8DirectionArrow({
  dir,
  cx,
  cy,
  active,
  small = false,
  color,
}: {
  dir: Direction;
  cx: number;
  cy: number;
  active: boolean;
  small?: boolean;
  color: string;
}) {
  if (dir === "SINK") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={small ? 2.5 : 5} fill="none" stroke={color} strokeWidth={small ? 1.3 : 2} />
        <circle cx={cx} cy={cy} r={small ? 1.2 : 2.5} fill={color} />
      </g>
    );
  }
  const [vx, vy] = DIR_VECTOR[dir];
  const mag = Math.sqrt(vx * vx + vy * vy);
  const nx = vx / mag;
  const ny = vy / mag;
  const px = -ny;
  const py = nx;

  const len = small ? 10 : (active ? 17 : 14);
  const x1 = cx - nx * len * 0.48;
  const y1 = cy - ny * len * 0.48;
  const x2 = cx + nx * len * 0.52;
  const y2 = cy + ny * len * 0.52;

  const ah = small ? 3.4 : (active ? 6 : 5);
  const hs = small ? 2.0 : (active ? 3.5 : 2.8);
  const ax = x2 - nx * ah + px * hs;
  const ay = y2 - ny * ah + py * hs;
  const bx = x2 - nx * ah - px * hs;
  const by = y2 - ny * ah - py * hs;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={small ? 1.25 : (active ? 2.2 : 1.6)}
        strokeLinecap="round"
      />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} fill={color} />
    </g>
  );
}

export function WatershedPlayground() {
  const { lang } = useAtlas();
  const [mode, setMode] = useState<ViewMode>("dem");
  const [hovered, setHovered] = useState<[number, number] | null>(null);
  const [clicked, setClicked] = useState<[number, number] | null>(null);
  const [showDivide, setShowDivide] = useState(true); // Starts with Drainage Divide enabled on initial view
  const [showCalculationGuide, setShowCalculationGuide] = useState(true); // Educational hand-calculation guide disclosure
  const [activeGuideTab, setActiveGuideTab] = useState<"qp" | "tc" | "hydrograph" | "sheet" | "all">("qp");
  const [animStep, setAnimStep] = useState(0);
  const [autoSimulating, setAutoSimulating] = useState(false);
  const [hydrographView, setHydrographView] = useState<"cell" | "outlet" | "compare">("cell");
  const [showFloatingCard, setShowFloatingCard] = useState(false); // Does not pop up immediately on first entry
  const [isMobile, setIsMobile] = useState(false);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const d8 = useMemo(
    () => computeHydrologicalD8(DEM, WATER_CELLS, WEST_OUTLET, EAST_OUTLET),
    []
  );
  const acc = useMemo(() => computeFlowAccumulation(DEM, d8), [d8]);
  const maxAcc = useMemo(() => Math.max(...acc.flat()), [acc]);

  const drainagePath = useMemo<[number, number][]>(
    () => (clicked ? traceDrainagePath(d8, clicked[0], clicked[1]) : []),
    [d8, clicked]
  );

  const upstreamSet = useMemo<Set<string>>(
    () => (clicked ? findUpstreamCells(d8, clicked[0], clicked[1]) : new Set()),
    [d8, clicked]
  );

  // Full set of contributing cells (all upstream cells + clicked pour point)
  const fullCatchmentSet = useMemo<Set<string>>(() => {
    if (!clicked) return new Set();
    const set = new Set(upstreamSet);
    set.add(`${clicked[0]},${clicked[1]}`);
    return set;
  }, [clicked, upstreamSet]);

  // Exact perimeter polygon boundary segments enclosing the delineated catchment pixels
  const catchmentBoundarySegments = useMemo(() => {
    if (!clicked || fullCatchmentSet.size === 0) return [];
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    fullCatchmentSet.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const x1 = c * CELL_W;
      const x2 = (c + 1) * CELL_W;
      const y1 = r * CELL_H;
      const y2 = (r + 1) * CELL_H;

      // Top outer edge
      if (r === 0 || !fullCatchmentSet.has(`${r - 1},${c}`)) {
        segs.push({ x1, y1, x2, y2: y1 });
      }
      // Bottom outer edge
      if (r === ROWS - 1 || !fullCatchmentSet.has(`${r + 1},${c}`)) {
        segs.push({ x1, y1: y2, x2, y2 });
      }
      // Left outer edge
      if (c === 0 || !fullCatchmentSet.has(`${r},${c - 1}`)) {
        segs.push({ x1, y1, x2: x1, y2 });
      }
      // Right outer edge
      if (c === COLS - 1 || !fullCatchmentSet.has(`${r},${c + 1}`)) {
        segs.push({ x1: x2, y1, x2, y2 });
      }
    });
    return segs;
  }, [clicked, fullCatchmentSet]);

  // Dynamically compute the exact mathematical boundary segments (Su Ayrım Çizgisi)
  // separating the two neighboring drainage basins
  const { basinMap, divideSegments, divideCenterPoints } = useMemo(() => {
    const bMap = new Map<string, "A" | "B">();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const path = traceDrainagePath(d8, r, c);
        const sink = path[path.length - 1];
        const isA = sink[0] === WEST_OUTLET[0] && sink[1] === WEST_OUTLET[1];
        bMap.set(`${r},${c}`, isA ? "A" : "B");
      }
    }

    const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const centerPoints: [number, number][] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cur = bMap.get(`${r},${c}`);
        // Right neighbor boundary
        if (c + 1 < COLS) {
          const right = bMap.get(`${r},${c + 1}`);
          if (cur !== right) {
            const x = (c + 1) * CELL_W;
            const y1 = r * CELL_H;
            const y2 = (r + 1) * CELL_H;
            segments.push({ x1: x, y1, x2: x, y2 });
            centerPoints.push([x, (y1 + y2) / 2]);
          }
        }
        // Bottom neighbor boundary
        if (r + 1 < ROWS) {
          const bottom = bMap.get(`${r + 1},${c}`);
          if (cur !== bottom) {
            const y = (r + 1) * CELL_H;
            const x1 = c * CELL_W;
            const x2 = (c + 1) * CELL_W;
            segments.push({ x1, y1: y, x2, y2: y });
            centerPoints.push([(x1 + x2) / 2, y]);
          }
        }
      }
    }

    return { basinMap: bMap, divideSegments: segments, divideCenterPoints: centerPoints };
  }, [d8]);

  // Animate flow path downstream
  useEffect(() => {
    setAnimStep(0);
    if (!clicked || drainagePath.length === 0) return;
    let step = 0;
    const tick = () => {
      step++;
      setAnimStep(step);
      if (step < drainagePath.length) {
        animRef.current = setTimeout(tick, 45);
      }
    };
    animRef.current = setTimeout(tick, 30);
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [clicked, drainagePath]);

  // Auto Rainstorm Simulation runner (dynamically rotates across catchments)
  useEffect(() => {
    if (!autoSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    let seedIdx = 0;
    simIntervalRef.current = setInterval(() => {
      seedIdx = (seedIdx + 1) % RAINSTORM_SEEDS.length;
      setShowDivide(false);
      setClicked(RAINSTORM_SEEDS[seedIdx]);
    }, 2400);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [autoSimulating]);

  const handleCellClick = useCallback((r: number, c: number) => {
    setAutoSimulating(false);
    setShowDivide(false);
    setClicked((prev) => {
      if (prev && prev[0] === r && prev[1] === c) {
        setShowFloatingCard(false);
        return null;
      }
      setShowFloatingCard(true);
      return [r, c];
    });
  }, []);

  // Responsive window resize listener & card position clamping
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setCardPosition((prev) => {
        if (!prev) return null;
        const cardW = cardRef.current?.offsetWidth || 620;
        const minVisibleHeaderH = 44;
        return {
          x: Math.max(8, Math.min(window.innerWidth - cardW - 8, prev.x)),
          y: Math.max(8, Math.min(window.innerHeight - minVisibleHeaderH, prev.y)),
        };
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draggable inspector card state & pointer event handlers
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragDataRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const handleDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    dragDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  }, []);

  const handleDragMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragDataRef.current) return;
    const { startX, startY, origX, origY } = dragDataRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const cardW = cardRef.current ? cardRef.current.offsetWidth : 620;

    // Horizontal clamping: stays comfortably inside the window
    const clampedX = Math.max(8, Math.min(window.innerWidth - cardW - 8, origX + dx));

    // Vertical clamping:
    // Top boundary: keeps header inside viewport (min 8px)
    // Bottom boundary: ALLOWS dragging downwards partially off-screen so the user can inspect the DEM!
    // Leaves only the top header bar (~44px) at the bottom edge so it can be grabbed and dragged back up.
    const minVisibleHeaderH = 44;
    const clampedY = Math.max(8, Math.min(window.innerHeight - minVisibleHeaderH, origY + dy));

    setCardPosition({ x: clampedX, y: clampedY });
  }, []);

  const handleDragEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragDataRef.current) {
      dragDataRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  }, []);

  // Floating position of the hydrograph card relative to the clicked cell
  const floatingPos = useMemo(() => {
    if (!clicked) return null;
    const r = clicked[0];
    const c = clicked[1];

    // Intelligently place card in the opposite quadrant so it never covers the clicked cell or its streamline
    const isRight = c >= 8;
    const isBottom = r >= 5;

    const hStyle = isRight
      ? { left: "1.5%", right: "auto" }
      : { right: "1.5%", left: "auto" };

    const vStyle = isBottom
      ? { top: "1.5%", bottom: "auto" }
      : { bottom: "1.5%", top: "auto" };

    return { ...hStyle, ...vStyle };
  }, [clicked]);

  const visiblePath = useMemo(
    () => new Set(drainagePath.slice(0, animStep).map(([r, c]) => `${r},${c}`)),
    [drainagePath, animStep]
  );

  // Target cell information (hovered or clicked)
  const targetCell = hovered ?? clicked;
  const targetRow = targetCell ? targetCell[0] : null;
  const targetCol = targetCell ? targetCell[1] : null;
  const targetKey = targetCell ? `${targetRow},${targetCol}` : "";
  const targetElev = targetCell ? DEM[targetRow!][targetCol!] : null;
  const targetDir = targetCell ? d8[targetRow!][targetCol!] : null;
  const targetAcc = targetCell ? acc[targetRow!][targetCol!] : null;
  const targetIsWater = targetCell ? WATER_CELLS.has(targetKey) : false;

  // Identify which neighboring catchment the target cell drains into
  const targetCatchment = useMemo(() => {
    if (!targetCell) return null;
    const path = traceDrainagePath(d8, targetCell[0], targetCell[1]);
    const outlet = path[path.length - 1];
    if (outlet[0] === WEST_OUTLET[0] && outlet[1] === WEST_OUTLET[1]) {
      return {
        name: lang === "tr" ? "Batı Havzası (Göl A Çıkışı)" : "West Basin (Lake A Outlet)",
        area: 83,
      };
    }
    if (outlet[0] === EAST_OUTLET[0] && outlet[1] === EAST_OUTLET[1]) {
      return {
        name: lang === "tr" ? "Doğu Havzası (Körfez B Çıkışı)" : "East Basin (Bay B Outlet)",
        area: 97,
      };
    }
    return null;
  }, [targetCell, d8, lang]);

  // Contributing catchment area for clicked cell
  const selectedArea = clicked ? fullCatchmentSet.size : 0;
  const selectedAreaPct = clicked ? ((selectedArea / TOTAL_CELLS) * 100).toFixed(1) : "0";

  // Longest upstream path into clicked cell (determining concentration time Tc at clicked pixel)
  const maxUpstreamPathLen = useMemo(() => {
    if (!clicked || fullCatchmentSet.size <= 1) return 1;
    let maxLen = 1;
    fullCatchmentSet.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const path = traceDrainagePath(d8, r, c);
      const idx = path.findIndex(([pr, pc]) => pr === clicked[0] && pc === clicked[1]);
      if (idx > maxLen) maxLen = idx;
    });
    return maxLen;
  }, [clicked, fullCatchmentSet, d8]);

  // Concentration time at the clicked cell itself (travel from farthest ridge cell into clicked pixel)
  // Tc = max(8, L * 4) min (4 min/cell velocity travel time, v ≈ 4.17 m/s)
  const tcCell = Math.max(8, maxUpstreamPathLen * 4);

  // Basin terminal pour point information
  const terminalOutlet = drainagePath.length > 0 ? drainagePath[drainagePath.length - 1] : [11, 3];
  const isWestOutlet = terminalOutlet[0] === WEST_OUTLET[0] && terminalOutlet[1] === WEST_OUTLET[1];

  // Check if clicked cell is the terminal basin outlet itself
  const isAtOutlet = Boolean(
    clicked && clicked[0] === terminalOutlet[0] && clicked[1] === terminalOutlet[1]
  );

  // Dynamically compute the outlet's full contributing catchment
  const outletCatchmentSet = useMemo(() => {
    if (isAtOutlet && clicked) return fullCatchmentSet;
    const set = findUpstreamCells(d8, terminalOutlet[0], terminalOutlet[1]);
    set.add(`${terminalOutlet[0]},${terminalOutlet[1]}`);
    return set;
  }, [d8, terminalOutlet, isAtOutlet, clicked, fullCatchmentSet]);

  const maxOutletPathLen = useMemo(() => {
    if (isAtOutlet) return maxUpstreamPathLen;
    let maxLen = 1;
    outletCatchmentSet.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const path = traceDrainagePath(d8, r, c);
      const idx = path.findIndex(([pr, pc]) => pr === terminalOutlet[0] && pc === terminalOutlet[1]);
      if (idx > maxLen) maxLen = idx;
    });
    return maxLen;
  }, [terminalOutlet, outletCatchmentSet, d8, isAtOutlet, maxUpstreamPathLen]);

  const basinTotalArea = outletCatchmentSet.size;
  const tcOutlet = isAtOutlet ? tcCell : Math.max(8, maxOutletPathLen * 4);

  // Travel time from clicked cell downstream to the basin outlet
  const travelTimeToOutlet = isAtOutlet ? 0 : Math.max(0, (drainagePath.length - 1) * 4);

  // Peak discharges (Exact Rational Method: Q = (C * I * A) / 3.6)
  // C = 0.45, I = 35 mm/hr, 1 cell = 1.0 km2
  // Multiplier: (0.45 * 35) / 3.6 = 15.75 / 3.6 = 4.375 m3/(s·km2) exact
  const qCellPeak = clicked ? (4.375 * selectedArea).toFixed(1) : "0.0";
  const qOutletPeak = isAtOutlet
    ? qCellPeak
    : (4.375 * basinTotalArea).toFixed(1);

  // Backward compatibility aliases
  const simulatedDischarge = qCellPeak;
  const timeOfConcentration = String(tcCell);

  const p = copy.playground;

  return (
    <div
      className="w-full bg-[var(--atlas-card)] border-[1.5px] border-[var(--frame)] shadow-[8px_8px_0_var(--shadow)] overflow-hidden transition-all duration-300"
      data-screen-label="Watershed Simulator"
    >
      {/* ── Top Apple-style Control Bar ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b-[1.5px] border-[var(--frame)] bg-[var(--paper)]">
        {/* Top-Left Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-plex-mono text-[10px] font-bold text-[var(--mut)] uppercase tracking-wider mr-1">
            {t(p.layerLabel, lang)}
          </span>
          <button
            type="button"
            onClick={() => setMode("dem")}
            className={`cursor-pointer px-3.5 py-1.5 rounded-full font-plex-mono text-[11px] font-semibold tracking-wide border transition-all duration-200 ${
              mode === "dem"
                ? "bg-[var(--frame)] text-[var(--paper)] border-[var(--frame)] shadow-xs"
                : "bg-transparent text-[var(--ink2)] border-[var(--line)] hover:border-[var(--frame)] hover:text-[var(--ink)]"
            }`}
          >
            {t(p.demButton, lang)}
          </button>
          <button
            type="button"
            onClick={() => setMode("d8")}
            className={`cursor-pointer px-3.5 py-1.5 rounded-full font-plex-mono text-[11px] font-semibold tracking-wide border transition-all duration-200 ${
              mode === "d8"
                ? "bg-[var(--frame)] text-[var(--paper)] border-[var(--frame)] shadow-xs"
                : "bg-transparent text-[var(--ink2)] border-[var(--line)] hover:border-[var(--frame)] hover:text-[var(--ink)]"
            }`}
          >
            {t(p.d8Button, lang)}
          </button>
          <button
            type="button"
            onClick={() => setMode("acc")}
            className={`cursor-pointer px-3.5 py-1.5 rounded-full font-plex-mono text-[11px] font-semibold tracking-wide border transition-all duration-200 ${
              mode === "acc"
                ? "bg-[var(--frame)] text-[var(--paper)] border-[var(--frame)] shadow-xs"
                : "bg-transparent text-[var(--ink2)] border-[var(--line)] hover:border-[var(--frame)] hover:text-[var(--ink)]"
            }`}
          >
            {t(p.accButton, lang)}
          </button>
        </div>

        {/* Top-Right: Auto Rainstorm Simulation & Multi-Basin Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dynamic Rainstorm Simulator Button */}
          <button
            type="button"
            onClick={() => {
              setShowDivide(false);
              setAutoSimulating((prev) => !prev);
            }}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-plex-mono text-[10.5px] font-bold tracking-wider border transition-all duration-200 ${
              autoSimulating
                ? "bg-sky-600 text-white border-sky-600 shadow-[0_0_12px_rgba(2,132,199,0.5)] animate-pulse"
                : "bg-[var(--atlas-card)] border-[var(--frame)] text-[var(--ink)] hover:border-[var(--acc)] hover:text-[var(--acc)]"
            }`}
          >
            {autoSimulating ? <Pause size={12} /> : <Play size={12} />}
            <span>
              {autoSimulating
                ? lang === "tr"
                  ? "Yağış Simülasyonu Aktif"
                  : "Simulating Storm..."
                : lang === "tr"
                ? "▶ Yağış Simülasyonu"
                : "▶ Run Rain Simulation"}
            </span>
          </button>

          <span className="w-px h-4 bg-[var(--line)] hidden sm:block" />

          {/* Su Ayrım Çizgisi Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setAutoSimulating(false);
              setShowDivide((prev) => !prev);
              setClicked(null);
            }}
            title={
              lang === "tr"
                ? "Batı ve Doğu havzalarını ayıran su ayrım çizgisini göster (Drainage Divide)"
                : "Show the drainage divide line separating West and East basins"
            }
            className={`cursor-pointer px-3 py-1.5 text-[10.5px] font-plex-mono font-bold border rounded-full transition-all ${
              showDivide
                ? "bg-amber-500 text-white border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                : "border-amber-500/70 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            }`}
          >
            {t(p.presetDivide, lang)}
          </button>

          {(clicked || showDivide) && (
            <button
              type="button"
              onClick={() => {
                setAutoSimulating(false);
                setShowDivide(false);
                setClicked(null);
              }}
              className="cursor-pointer px-3 py-1.5 text-[10.5px] font-plex-mono font-medium border border-[var(--line)] hover:border-red-400 text-[var(--mut)] hover:text-red-500 rounded-full transition-colors"
            >
              ↺ {lang === "tr" ? "Sıfırla" : "Reset"}
            </button>
          )}
        </div>
      </div>

      {/* ── Real-Time Dynamic Multi-Basin Telemetry & Hydraulic HUD ── */}
      <div className="border-b-[1.5px] border-[var(--frame)] bg-[var(--paper)]">
        {/* Primary Cell Telemetry Bar (Rock-solid fixed height, zero wrapping jitter across all cell clicks) */}
        <div
          className="px-6 h-[46px] flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar whitespace-nowrap font-plex-mono text-[11px] select-none"
          aria-live="polite"
        >
          {showDivide ? (
            <div className="flex items-center gap-2 flex-none">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping flex-none" />
              <span className="font-bold text-amber-700 dark:text-amber-400 text-[11px]">
                {lang === "tr"
                  ? "SU AYRIM ÇİZGİSİ (DRAINAGE DIVIDE): BATI (%46.1) VE DOĞU (%53.9) HAVZALARINI AYIRAN DAĞ SIRTI"
                  : "DRAINAGE DIVIDE: RIDGE LINE SEPARATING WEST (46.1%) & EAST (53.9%) BASINS"}
              </span>
            </div>
          ) : targetCell ? (
            <>
              {/* Cell coordinate */}
              <div className="flex items-center gap-1.5 flex-none">
                <span className="text-[var(--mut)] uppercase text-[9px] tracking-wider">
                  {t(p.cell, lang)}
                </span>
                <span className="font-semibold text-[var(--ink)]">
                  [{targetRow! + 1}, {targetCol! + 1}]
                </span>
              </div>

              <span className="w-px h-3.5 bg-[var(--line)] flex-none" />

              {/* Elevation */}
              <div className="flex items-center gap-1.5 flex-none">
                <span className="text-[var(--mut)] uppercase text-[9px] tracking-wider">
                  {t(p.elev, lang)}
                </span>
                <span className="font-semibold text-[var(--acc)]">
                  {targetElev} m {targetIsWater && <span className="text-sky-600 font-bold">({lang === "tr" ? "≈ 0m Deniz" : "≈ 0m Sea Level"})</span>}
                </span>
              </div>

              <span className="w-px h-3.5 bg-[var(--line)] flex-none" />

              {/* D8 Flow */}
              <div className="flex items-center gap-1.5 flex-none">
                <span className="text-[var(--mut)] uppercase text-[9px] tracking-wider">
                  {t(p.d8Flow, lang)}
                </span>
                <span className="font-semibold text-[var(--ink)]">
                  {DIR_ARROW[targetDir!]} {targetDir}
                </span>
              </div>

              <span className="w-px h-3.5 bg-[var(--line)] flex-none" />

              {/* Flow Accumulation */}
              <div className="flex items-center gap-1.5 flex-none">
                <span className="text-[var(--mut)] uppercase text-[9px] tracking-wider">
                  {t(p.acc, lang)}
                </span>
                <span className="font-semibold text-[var(--field)]">{targetAcc} {lang === "tr" ? "hücre" : "cells"}</span>
              </div>

              {/* Delineated Catchment Size */}
              {clicked && (
                <>
                  <span className="w-px h-3.5 bg-[var(--line)] flex-none" />
                  <div className="flex items-center gap-1.5 flex-none">
                    <span className="text-[var(--mut)] uppercase text-[9px] tracking-wider">
                      {t(p.watershed, lang)}
                    </span>
                    <span className="font-semibold text-[var(--acc)]">
                      {selectedArea} {lang === "tr" ? "hücre" : "cells"} ({lang === "tr" ? `%${selectedAreaPct}` : `${selectedAreaPct}%`})
                    </span>
                  </div>

                  <span className="w-px h-3.5 bg-[var(--line)] flex-none" />
                  <button
                    type="button"
                    onClick={() => setShowFloatingCard((prev) => !prev)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 text-[10.5px] font-plex-mono font-bold rounded-full border border-sky-600/40 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-all flex-none"
                  >
                    <Waves size={12} />
                    <span>
                      {showFloatingCard
                        ? lang === "tr"
                          ? "📊 Hidrografı Gizle"
                          : "📊 Hide Hydrograph"
                        : lang === "tr"
                        ? "📊 Hidrografı Göster"
                        : "📊 Show Hydrograph"}
                    </span>
                  </button>
                </>
              )}
            </>
          ) : (
            <span className="text-[var(--mut)] font-display text-[12px] flex-none">
              {t(p.emptyHint, lang)}
            </span>
          )}
        </div>
      </div>

      {/* ── Interactive SVG DEM Canvas (100% RESPONSIVE, NO HORIZONTAL SCROLL) ── */}
      <div className="relative w-full bg-[var(--paper)]">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto block select-none"
          style={{ maxHeight: "580px" }}
          aria-label="Interactive 15x12 Dendritic Multi-Basin DEM Grid with Su Ayrım Çizgisi and Water Surfaces"
        >
          <defs>
            {/* Flow path arrow marker */}
            <marker
              id="flow-arrow-head"
              markerWidth="6"
              markerHeight="6"
              refX="3"
              refY="3"
              orient="auto"
            >
              <polygon points="0,0 6,3 0,6" fill="var(--acc)" />
            </marker>

            {/* Glowing filter for river channels */}
            <filter id="river-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="var(--acc)" floodOpacity="0.45" />
            </filter>

            {/* Glowing filter for Su Ayrım Çizgisi */}
            <filter id="divide-glow" x="-30%" y="-10%" width="160%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.75" />
            </filter>
          </defs>

          {DEM.map((row, r) =>
            row.map((elev, c) => {
              const x = c * CELL_W;
              const y = r * CELL_H;
              const cx = x + CELL_W / 2;
              const cy = y + CELL_H / 2;
              const key = `${r},${c}`;

              const isClicked = clicked ? clicked[0] === r && clicked[1] === c : false;
              const isHovered = hovered ? hovered[0] === r && hovered[1] === c : false;
              const isPath = visiblePath.has(key);
              const isUpstream = upstreamSet.has(key);
              const isWater = WATER_CELLS.has(key);
              const isEdgeOutlet = (r === 11 && c === 3) || (r === 11 && c === 12);
              const accVal = acc[r][c];
              const cellBasin = basinMap.get(key);

              // Dynamic cell fill color
              let fill: string;
              if (showDivide) {
                // When showing Su Ayrım Çizgisi: tint West Basin (A) and East Basin (B)
                if (cellBasin === "A") {
                  fill = "color-mix(in srgb, #38bdf8 22%, var(--atlas-card))";
                } else {
                  fill = "color-mix(in srgb, #a7f3d0 22%, var(--atlas-card))";
                }
              } else if (isClicked) {
                fill = "#0369a1"; // Deep distinct sapphire for clicked pour point
              } else if (isUpstream && clicked) {
                // Catchment cells: tinted with crisp sky blue while preserving elevation context
                const baseColor = mode === "acc" ? getAccColor(accVal, maxAcc, isWater) : getElevColor(elev, isWater);
                fill = `color-mix(in srgb, #0284c7 35%, ${baseColor})`;
              } else if (mode === "dem") {
                fill = getElevColor(elev, isWater);
              } else if (mode === "d8") {
                fill = getElevColor(elev, isWater);
              } else {
                fill = getAccColor(accVal, maxAcc, isWater);
              }

              // Border stroke
              let stroke = isWater ? "rgba(2,132,199,0.35)" : "rgba(22,34,58,0.14)";
              let strokeWidth = 0.8;
              if (isHovered) {
                stroke = "var(--frame)";
                strokeWidth = 2.2;
              } else if (isClicked) {
                stroke = "#ffffff";
                strokeWidth = 2.8;
              } else if (isEdgeOutlet) {
                stroke = "#0284c7";
                strokeWidth = 1.6;
              }

              // Text labeling & positions
              let textLabel = "";
              let textColor = "var(--ink)";
              let textY = cy;

              if (mode === "dem") {
                textLabel = `${elev}`;
                textColor = isClicked ? "#ffffff" : isUpstream && clicked ? "#0f172a" : getElevTextColor(elev, isWater);
              } else if (mode === "acc") {
                textLabel = `${accVal}`;
                textColor = isClicked
                  ? "#ffffff"
                  : getAccTextColor(accVal, maxAcc, showDivide, isUpstream && Boolean(clicked));
                textY = cy - 6;
              } else if (mode === "d8") {
                textLabel = `${elev}`;
                textColor = isClicked ? "#ffffff" : isUpstream && clicked ? "#0f172a" : isWater ? "#0c4a6e" : "rgba(22,34,58,0.55)";
                textY = cy - 7;
              }

              // Show direction arrow in D8 mode, on hover/path/clicked, AND inside Flow Accumulation (acc mode)
              const showArrow = mode === "d8" || mode === "acc" || isHovered || isClicked;
              const isSmallArrow = mode === "acc" && !isHovered && !isClicked;
              const arrowCy = mode === "acc" ? cy + 6 : mode === "d8" ? cy + 6 : cy;

              const arrowColor = isClicked
                ? "#ffffff"
                : isHovered
                ? "var(--acc)"
                : mode === "acc"
                ? (accVal >= 35 ? "#ffffff" : "#0f2f5c")
                : isWater
                ? "#0284c7"
                : "var(--frame)";

              return (
                <g
                  key={key}
                  role="button"
                  tabIndex={0}
                  aria-label={`Cell [${r + 1}, ${c + 1}]: ${elev}m, ${isWater ? "Water surface" : "Terrain"}, flow ${DIR_ARROW[d8[r][c]]}, accumulation ${accVal}`}
                  onClick={() => handleCellClick(r, c)}
                  onMouseEnter={() => setHovered([r, c])}
                  onMouseLeave={() => setHovered(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleCellClick(r, c);
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    style={{ transition: "fill 0.18s ease, stroke 0.12s ease" }}
                  />

                  {/* Water surface ripple symbol in background of water cells */}
                  {isWater && !isClicked && (
                    <text
                      x={x + 7}
                      y={y + 10}
                      fontSize="9"
                      fill="rgba(12,74,110,0.45)"
                      fontFamily="sans-serif"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      ≈
                    </text>
                  )}

                  {/* Edge Pour Point indicator badge on bottom edge */}
                  {isEdgeOutlet && !isClicked && (
                    <circle
                      cx={cx}
                      cy={y + CELL_H - 4}
                      r={2.5}
                      fill="var(--field)"
                      style={{ pointerEvents: "none" }}
                    />
                  )}

                  {/* Elevation or Accumulation Number with High-Contrast Halo Casing */}
                  {textLabel && (
                    <text
                      x={cx}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={mode === "d8" ? "7.5" : mode === "acc" ? "8.5" : accVal >= 100 ? "8.5" : "9.5"}
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight={mode === "acc" ? "700" : "600"}
                      fill={textColor}
                      paintOrder="stroke fill"
                      stroke={
                        mode === "acc"
                          ? textColor === "#ffffff"
                            ? "rgba(12, 74, 110, 0.95)"
                            : "rgba(255, 255, 255, 0.95)"
                          : undefined
                      }
                      strokeWidth={mode === "acc" ? "2.2" : undefined}
                      strokeLinejoin="round"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {textLabel}
                    </text>
                  )}

                  {/* D8 Direction Arrow (Full size in D8 mode, Small size in Flow Accumulation) */}
                  {showArrow && (
                    <D8DirectionArrow
                      dir={d8[r][c]}
                      cx={cx}
                      cy={arrowCy}
                      active={isHovered || isClicked}
                      small={isSmallArrow}
                      color={arrowColor}
                    />
                  )}
                </g>
              );
            })
          )}

          {/* ── 1. UPSTREAM CATCHMENT PERIMETER POLYGON (Makes the catchment standout cleanly!) ── */}
          {catchmentBoundarySegments.length > 0 && !showDivide && (
            <g className="catchment-polygon-boundary pointer-events-none">
              {/* Outer glowing halo */}
              {catchmentBoundarySegments.map((seg, idx) => (
                <line
                  key={`c-glow-${idx}`}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#38bdf8"
                  strokeWidth={5}
                  opacity={0.4}
                  strokeLinecap="round"
                />
              ))}
              {/* Crisp primary boundary perimeter */}
              {catchmentBoundarySegments.map((seg, idx) => (
                <line
                  key={`c-line-${idx}`}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#0284c7"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                />
              ))}
            </g>
          )}

          {/* ── 2. SIMPLIFIED & TRACTABLE DOWNSTREAM FLOW STREAMLINE ── */}
          {drainagePath.length > 1 && !showDivide && (
            <g className="downstream-streamline pointer-events-none">
              {/* Single smooth streamline tracing down to outlet */}
              <polyline
                points={drainagePath
                  .map(([r, c]) => `${c * CELL_W + CELL_W / 2},${r * CELL_H + CELL_H / 2}`)
                  .join(" ")}
                fill="none"
                stroke="#0284c7"
                strokeWidth={2.4}
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
              />
              {/* Terminal edge outlet sink circle */}
              {(() => {
                const sink = drainagePath[drainagePath.length - 1];
                const sx = sink[1] * CELL_W + CELL_W / 2;
                const sy = sink[0] * CELL_H + CELL_H / 2;
                return (
                  <circle
                    cx={sx}
                    cy={sy}
                    r={4}
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth={1.8}
                  />
                );
              })()}
            </g>
          )}

          {/* ── 3. CLICKED POUR POINT MARKER ── */}
          {clicked && !showDivide && (
            <g
              transform={`translate(${clicked[1] * CELL_W + CELL_W / 2}, ${clicked[0] * CELL_H + CELL_H / 2})`}
              className="pointer-events-none"
            >
              <circle r={8} fill="none" stroke="#0284c7" strokeWidth={2} opacity={0.6} className="animate-ping" />
              <circle r={4.5} fill="#0284c7" stroke="#ffffff" strokeWidth={1.8} />
            </g>
          )}

          {/* ── THE TRUE SU AYRIM ÇİZGİSİ (Drainage Divide Boundary Segments) ── */}
          {/* Accurately traces the exact boundary between cells draining to Basin A and Basin B */}
          {showDivide && (
            <g className="drainage-divide-overlay pointer-events-none">
              {/* Outer soft ambient glow for each boundary segment */}
              {divideSegments.map((seg, idx) => (
                <line
                  key={`glow-${idx}`}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#f59e0b"
                  strokeWidth={7}
                  opacity={0.4}
                  strokeLinecap="round"
                />
              ))}

              {/* Crisp dashed Su Ayrım Çizgisi ridge lines */}
              {divideSegments.map((seg, idx) => (
                <line
                  key={`line-${idx}`}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#d97706"
                  strokeWidth={3.2}
                  strokeDasharray="7 4"
                  strokeLinecap="round"
                  filter="url(#divide-glow)"
                />
              ))}

              {/* Ridge crest mountain symbols along the divide points */}
              {divideCenterPoints.map(([px, py], idx) => (
                <g key={`pt-${idx}`} transform={`translate(${px}, ${py})`}>
                  <polygon
                    points="0,-5 4,4 -4,4"
                    fill="#f59e0b"
                    stroke="#78350f"
                    strokeWidth={0.9}
                  />
                </g>
              ))}

              {/* Top Floating Badge */}
              <g transform="translate(364, 20)">
                <rect
                  x={lang === "tr" ? "-130" : "-85"}
                  y="-12"
                  width={lang === "tr" ? "260" : "170"}
                  height="22"
                  rx="11"
                  fill="var(--frame)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="2.5"
                  textAnchor="middle"
                  fontSize="8.5"
                  fontFamily="var(--font-ibm-plex-mono), monospace"
                  fontWeight="bold"
                  fill="#fef3c7"
                  letterSpacing="0.06em"
                >
                  {lang === "tr" ? "▲ SU AYRIM ÇİZGİSİ (DRAINAGE DIVIDE) ▲" : "▲ DRAINAGE DIVIDE ▲"}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* ── Dynamic Non-Blocking Floating Hydrograph Inspector Card (Draggable across Window, Fully Responsive, High-Legibility) ── */}
        {showFloatingCard && clicked && !showDivide && (floatingPos || cardPosition) && (
          <div
            ref={cardRef}
            style={
              cardPosition
                ? {
                    left: `${cardPosition.x}px`,
                    top: `${cardPosition.y}px`,
                    right: "auto",
                    bottom: "auto",
                  }
                : isMobile
                ? undefined
                : floatingPos || undefined
            }
            className={
              cardPosition
                ? "fixed z-50 pointer-events-auto w-[96%] sm:w-[580px] md:w-[640px] lg:w-[680px] xl:w-[720px] max-w-[740px] rounded-xl border border-[var(--frame)]/85 bg-[var(--paper)]/95 dark:bg-[var(--atlas-card)]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-3 sm:p-4 flex flex-col gap-2.5 font-plex-mono text-[11px] select-none"
                : isMobile
                ? "fixed inset-x-2 bottom-3 z-50 pointer-events-auto max-h-[72vh] overflow-y-auto rounded-xl border border-[var(--frame)]/85 bg-[var(--paper)]/95 dark:bg-[var(--atlas-card)]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-3 flex flex-col gap-2.5 font-plex-mono text-[11px] animate-in fade-in slide-in-from-bottom-3 duration-200 select-none"
                : "absolute z-30 pointer-events-auto w-[96%] sm:w-[580px] md:w-[640px] lg:w-[680px] xl:w-[720px] max-w-[740px] rounded-xl border border-[var(--frame)]/85 bg-[var(--paper)]/95 dark:bg-[var(--atlas-card)]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.36)] p-3 sm:p-4 flex flex-col gap-2.5 font-plex-mono text-[11px] animate-in fade-in zoom-in-95 duration-150 select-none"
            }
          >
            {/* Card Header Bar (Draggable across the window) */}
            <div
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              style={{ touchAction: "none" }}
              className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5 cursor-grab active:cursor-grabbing select-none"
              title={lang === "tr" ? "Pencereyi taşımak için sürükleyin" : "Drag to move anywhere around window"}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--line)]/60 text-[var(--ink2)] text-[10px] sm:text-[10.5px] font-semibold">
                  <GripHorizontal size={14} className="text-[var(--mut)]" />
                  <span className="hidden sm:inline font-mono">{lang === "tr" ? "Taşı" : "Drag"}</span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-600 text-white shadow-2xs">
                  [{clicked[0] + 1}, {clicked[1] + 1}]
                </span>
                <span className="font-bold text-[12px] sm:text-[13px] text-[var(--ink)]">
                  {targetElev} m
                </span>
                <span className="text-[11px] text-[var(--mut)] hidden sm:inline">
                  • D8: {DIR_ARROW[targetDir!]} {targetDir}
                </span>
                <span className="text-[11px] text-[var(--mut)]">
                  • {lang === "tr" ? "Havza" : "Basin"}: {selectedArea} km² ({lang === "tr" ? `%${selectedAreaPct}` : `${selectedAreaPct}%`})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* 3-Way Mode Switcher */}
                <div className="flex items-center bg-[var(--paper)] dark:bg-[var(--frame)]/40 border border-[var(--line)] p-0.5 rounded-full text-[10px] sm:text-[10.5px]">
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setHydrographView("cell")}
                    className={`cursor-pointer px-2.5 sm:px-3 py-0.5 sm:py-1 font-bold rounded-full transition-all ${
                      hydrographView === "cell"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-[var(--mut)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {lang === "tr" ? "Hücre" : "Cell"}
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setHydrographView("outlet")}
                    className={`cursor-pointer px-2.5 sm:px-3 py-0.5 sm:py-1 font-bold rounded-full transition-all ${
                      hydrographView === "outlet"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-[var(--mut)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {lang === "tr" ? "Çıkış" : "Outlet"}
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setHydrographView("compare")}
                    className={`cursor-pointer px-2.5 sm:px-3 py-0.5 sm:py-1 font-bold rounded-full transition-all ${
                      hydrographView === "compare"
                        ? "bg-[var(--frame)] text-[var(--paper)] shadow-xs"
                        : "text-[var(--mut)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {lang === "tr" ? "Kıyasla" : "Compare"}
                  </button>
                </div>

                {/* Reset Position (Snap back to auto quadrant) */}
                {cardPosition && (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setCardPosition(null)}
                    title={lang === "tr" ? "Konumu Sıfırla (Otomatik Hizala)" : "Reset Position (Auto Align)"}
                    aria-label="Reset position"
                    className="cursor-pointer p-1.5 rounded-full border border-[var(--line)] hover:border-sky-400 text-[var(--mut)] hover:text-sky-600 transition-colors"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}

                {/* Dismiss button */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setShowFloatingCard(false)}
                  title={lang === "tr" ? "Gizle" : "Hide"}
                  aria-label={lang === "tr" ? "Pencereyi gizle" : "Dismiss inspector"}
                  className="cursor-pointer p-1.5 rounded-full border border-[var(--line)] hover:border-red-400 text-[var(--mut)] hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* 4 Spacious Metric Chips (High Legibility & Contrast) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-[var(--atlas-card)]/60 border border-[var(--line)]/90 rounded-md flex flex-col justify-center shadow-2xs">
                <span className="text-[10px] text-[var(--mut)] uppercase font-semibold tracking-wider">
                  {lang === "tr" ? <>📍 Q<sub>hücre</sub> (Pik)</> : <>📍 Q<sub>cell</sub> (Peak)</>}
                </span>
                <div className="flex items-baseline justify-center gap-1 mt-0.5">
                  <span className="font-bold text-[16px] sm:text-[18px] text-sky-600 dark:text-sky-400 leading-tight">{qCellPeak}</span>
                  <span className="text-[9.5px] text-[var(--ink2)] font-semibold">m³/s</span>
                </div>
              </div>
              <div className="p-2 bg-[var(--atlas-card)]/60 border border-[var(--line)]/90 rounded-md flex flex-col justify-center shadow-2xs">
                <span className="text-[10px] text-[var(--mut)] uppercase font-semibold tracking-wider">
                  {lang === "tr" ? <>Toplanma (T<sub>c</sub>)</> : <>Time of Conc. (T<sub>c</sub>)</>}
                </span>
                <div className="flex items-baseline justify-center gap-1 mt-0.5">
                  <span className="font-bold text-[16px] sm:text-[18px] text-[var(--ink)] leading-tight">{tcCell}</span>
                  <span className="text-[9.5px] text-[var(--ink2)] font-semibold">{lang === "tr" ? "dk" : "min"}</span>
                </div>
              </div>
              <div className="p-2 bg-[var(--atlas-card)]/60 border border-[var(--line)]/90 rounded-md flex flex-col justify-center shadow-2xs">
                <span className="text-[10px] text-[var(--mut)] uppercase font-semibold tracking-wider">
                  {lang === "tr" ? <>Mansap Varış (T<sub>mansap</sub>)</> : <>Downstream Travel (T<sub>downstream</sub>)</>}
                </span>
                <div className="flex items-baseline justify-center gap-1 mt-0.5">
                  <span className="font-bold text-[16px] sm:text-[18px] text-emerald-600 leading-tight">{travelTimeToOutlet}</span>
                  <span className="text-[9.5px] text-[var(--ink2)] font-semibold">{lang === "tr" ? "dk" : "min"}</span>
                </div>
              </div>
              <div className="p-2 bg-[var(--atlas-card)]/60 border border-[var(--line)]/90 rounded-md flex flex-col justify-center shadow-2xs">
                <span className="text-[10px] text-[var(--mut)] uppercase font-semibold tracking-wider">
                  {lang === "tr" ? <>🌊 Q<sub>çıkış</sub> (Havza)</> : <>🌊 Q<sub>outlet</sub> (Basin)</>}
                </span>
                <div className="flex items-baseline justify-center gap-1 mt-0.5">
                  <span className="font-bold text-[16px] sm:text-[18px] text-[var(--field)] leading-tight">{qOutletPeak}</span>
                  <span className="text-[9.5px] text-[var(--ink2)] font-semibold">m³/s</span>
                </div>
              </div>
            </div>

            {/* Enlarged Coupled Dual-Panel SVG Chart (620px × 270px) */}
            {(() => {
              const svgW = 620;
              const svgH = 270;
              const padL = 52;
              const padR = 26;
              const plotW = svgW - padL - padR;

              // Panel 1: Hyetograph (Dedicated top row for title, bars start cleanly at y = 26)
              const hyetoTitleY = 16;
              const hyetoTop = 26;
              const hyetoH = 40;
              const dividerY = 86;

              // Panel 2: Direct Runoff Hydrograph
              const hydroCeilY = 114;
              const hydroFloorY = 232;
              const hydroH = hydroFloorY - hydroCeilY;
              const FIXED_Q_MAX = 500;
              const tMax = 120;

              const tpCell = tcCell;
              const qPeakCellNum = Math.max(0.1, Number(qCellPeak));
              const peakXCell = padL + (tpCell / tMax) * plotW;
              const peakYCell = hydroFloorY - (Math.min(qPeakCellNum, FIXED_Q_MAX) / FIXED_Q_MAX) * hydroH;

              const tpOutlet = tcOutlet;
              const qPeakOutletNum = Math.max(0.1, Number(qOutletPeak));
              const peakXOutlet = padL + (tpOutlet / tMax) * plotW;
              const peakYOutlet = hydroFloorY - (Math.min(qPeakOutletNum, FIXED_Q_MAX) / FIXED_Q_MAX) * hydroH;

              const steps = 60;
              const cellPts: [number, number][] = [];
              const outletPts: [number, number][] = [];

              for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * tMax;
                const x = padL + (t / tMax) * plotW;

                // Standard Gamma Synthetic Unit Hydrograph Equation:
                // Q(t) = Qp * (t / Tp)^2.5 * exp(-2.5 * (t / Tp - 1))
                // Exact peak verification: at t = Tp, Q(Tp) = Qp * 1^2.5 * exp(0) = Qp
                const ratioC = tpCell > 0 ? t / tpCell : 0;
                const qC = (t > 0 && tpCell > 0)
                  ? qPeakCellNum * Math.pow(ratioC, 2.5) * Math.exp(-2.5 * (ratioC - 1))
                  : 0;
                const yC = hydroFloorY - (Math.min(qC, FIXED_Q_MAX) / FIXED_Q_MAX) * hydroH;
                cellPts.push([x, yC]);

                // Outlet flow (Standard Gamma Synthetic Unit Hydrograph)
                const ratioO = tpOutlet > 0 ? t / tpOutlet : 0;
                const qO = (t > 0 && tpOutlet > 0)
                  ? qPeakOutletNum * Math.pow(ratioO, 2.5) * Math.exp(-2.5 * (ratioO - 1))
                  : 0;
                const yO = hydroFloorY - (Math.min(qO, FIXED_Q_MAX) / FIXED_Q_MAX) * hydroH;
                outletPts.push([x, yO]);
              }

              const lineDCell = "M " + cellPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
              const areaDCell = `${lineDCell} L ${(padL + plotW).toFixed(1)},${hydroFloorY} L ${padL},${hydroFloorY} Z`;

              const lineDOutlet = "M " + outletPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
              const areaDOutlet = `${lineDOutlet} L ${(padL + plotW).toFixed(1)},${hydroFloorY} L ${padL},${hydroFloorY} Z`;

              // Left-aligned peak badge coordinates (Never overlap, never collide)
              const badgeW = 138;
              const badgeH = 20;
              const tagXCell = peakXCell + badgeW + 8 <= padL + plotW ? peakXCell + 6 : peakXCell - badgeW - 6;
              const tagYCell = Math.max(dividerY + 20, Math.min(peakYCell - 10, hydroFloorY - 24));

              const tagXOutlet = peakXOutlet + badgeW + 8 <= padL + plotW ? peakXOutlet + 6 : peakXOutlet - badgeW - 6;
              const tagYOutlet = (hydrographView === "compare" && Math.abs(peakXCell - peakXOutlet) < badgeW + 6 && !isAtOutlet)
                ? (tagYCell > hydroCeilY + 34 ? tagYCell - 24 : tagYCell + 24)
                : Math.max(dividerY + 20, Math.min(peakYOutlet - 10, hydroFloorY - 24));

              const hyetoBars = [
                { t0: 0, t1: 10, intensity: 20 },
                { t0: 10, t1: 20, intensity: 35 },
                { t0: 20, t1: 30, intensity: 15 },
              ];

              return (
                <div className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-md overflow-hidden p-2 shadow-2xs">
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto block select-none">
                    <defs>
                      <linearGradient id="mini-cell-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.03" />
                      </linearGradient>
                      <linearGradient id="mini-outlet-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* ── PANEL 1: INVERTED RAINFALL HYETOGRAPH (Zero Text-Bar Overlap) ── */}
                    {/* Dedicated Title Row ABOVE the bars */}
                    <text
                      x={padL}
                      y={hyetoTitleY}
                      fontSize="10.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="#0284c7"
                    >
                      ▼ {lang === "tr" ? "YAĞIŞ HİYETOGRAFI (Tasarım Sağanağı: 30 dk)" : "RAINFALL HYETOGRAPH (30 min Storm)"}
                    </text>
                    <text
                      x={padL + plotW}
                      y={hyetoTitleY}
                      textAnchor="end"
                      fontSize="9.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="#0284c7"
                    >
                      {lang === "tr" ? "I_maks = 35 mm/saat" : "I_max = 35 mm/h"}
                    </text>

                    {/* Rainfall grid guide */}
                    {[20, 40].map((iVal) => {
                      const y = hyetoTop + (iVal / 40) * hyetoH;
                      return (
                        <line
                          key={`hy-guide-${iVal}`}
                          x1={padL}
                          y1={y}
                          x2={padL + plotW}
                          y2={y}
                          stroke="#0284c7"
                          strokeOpacity={0.15}
                          strokeDasharray="2 3"
                          strokeWidth={0.8}
                        />
                      );
                    })}

                    {/* Rainfall inverted blocks (hanging downwards from y = 26) */}
                    {hyetoBars.map((bar, i) => {
                      const bx = padL + (bar.t0 / tMax) * plotW;
                      const bw = ((bar.t1 - bar.t0) / tMax) * plotW;
                      const bh = (bar.intensity / 40) * hyetoH;
                      return (
                        <g key={`mini-bar-${i}`}>
                          <rect
                            x={bx + 1}
                            y={hyetoTop}
                            width={bw - 2}
                            height={bh}
                            rx="2"
                            fill="#0284c7"
                            fillOpacity={0.45}
                            stroke="#0284c7"
                            strokeWidth={1}
                          />
                          {/* Intensity label centered inside bar */}
                          <text
                            x={bx + bw / 2}
                            y={hyetoTop + bh / 2 + 3.5}
                            textAnchor="middle"
                            fontSize="9.5"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fill="#ffffff"
                            fontWeight="bold"
                          >
                            {bar.intensity} {lang === "tr" ? "mm/sa" : "mm/h"}
                          </text>
                          {/* Duration label cleanly below the bar */}
                          <text
                            x={bx + bw / 2}
                            y={hyetoTop + hyetoH + 12}
                            textAnchor="middle"
                            fontSize="8.5"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fill="var(--ink2)"
                            fontWeight="500"
                          >
                            {bar.t0}-{bar.t1} {lang === "tr" ? "dk" : "min"}
                          </text>
                        </g>
                      );
                    })}

                    {/* ── MIDDLE SEPARATOR AXIS ── */}
                    <line
                      x1={padL}
                      y1={dividerY}
                      x2={padL + plotW}
                      y2={dividerY}
                      stroke="var(--line)"
                      strokeWidth={1.2}
                    />
                    <text
                      x={padL}
                      y={dividerY + 15}
                      fontSize="10.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="var(--ink2)"
                    >
                      ▲ {lang === "tr" ? "DOĞRUDAN AKIŞ HİDROGRAFI (0 - 500 m³/s)" : "DIRECT RUNOFF HYDROGRAPH (0 - 500 m³/s)"}
                    </text>
                    <text
                      x={padL + plotW}
                      y={dividerY + 15}
                      textAnchor="end"
                      fontSize="9"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fill="var(--mut)"
                    >
                      {isAtOutlet
                        ? (lang === "tr" ? "📍 Hücre = 🌊 Çıkış (Çakışık Nokta)" : "📍 Cell = 🌊 Outlet (Coincident Point)")
                        : (lang === "tr" ? `📍 Qh: ${qCellPeak} m³/s • 🌊 Qç: ${qOutletPeak} m³/s` : `📍 Qcell: ${qCellPeak} • 🌊 Qout: ${qOutletPeak}`)}
                    </text>

                    {/* ── PANEL 2: RUNOFF HYDROGRAPH (Spacious 118px chart area) ── */}
                    {/* Q ticks and gridlines */}
                    {[0, 100, 250, 400, 500].map((qVal) => {
                      const y = hydroFloorY - (qVal / FIXED_Q_MAX) * hydroH;
                      return (
                        <g key={`mini-q-${qVal}`}>
                          <line
                            x1={padL}
                            y1={y}
                            x2={padL + plotW}
                            y2={y}
                            stroke="var(--line)"
                            strokeDasharray="2 3"
                            strokeWidth={0.8}
                          />
                          <text
                            x={padL - 7}
                            y={y + 3.5}
                            textAnchor="end"
                            fontSize="9"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fontWeight="600"
                            fill="var(--ink2)"
                          >
                            {qVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Left Q-Axis Title */}
                    <text
                      x={14}
                      y={(hydroCeilY + hydroFloorY) / 2}
                      transform={`rotate(-90 14 ${(hydroCeilY + hydroFloorY) / 2})`}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="bold"
                      fill="var(--ink2)"
                    >
                      Q (m³/s)
                    </text>

                    {/* Curve 1: Basin Outlet */}
                    {(hydrographView === "outlet" || (hydrographView === "compare" && !isAtOutlet)) && (
                      <>
                        {hydrographView === "outlet" && <path d={areaDOutlet} fill="url(#mini-outlet-grad)" />}
                        <path
                          d={lineDOutlet}
                          fill="none"
                          stroke="#059669"
                          strokeWidth={hydrographView === "outlet" ? 2.6 : 2.0}
                          strokeDasharray={hydrographView === "compare" ? "4 3" : undefined}
                          strokeLinecap="round"
                        />
                        <line
                          x1={peakXOutlet}
                          y1={peakYOutlet}
                          x2={peakXOutlet}
                          y2={hydroFloorY}
                          stroke="#059669"
                          strokeDasharray="2 2"
                          strokeWidth={0.9}
                        />
                        <circle cx={peakXOutlet} cy={peakYOutlet} r={4.5} fill="#059669" stroke="var(--paper)" strokeWidth={1.5} />

                        {/* Left-Aligned Floating Badge for Outlet */}
                        <g transform={`translate(${tagXOutlet}, ${tagYOutlet})`}>
                          <rect x="0" y="-9.5" width={badgeW} height={badgeH} rx="4" fill="#064e3b" stroke="#059669" strokeWidth={1} />
                          <text x="6" y="4" textAnchor="start" fontSize="9" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#ffffff">
                            {lang === "tr" ? `🌊 Qç: ${qOutletPeak} m³/s @ ${tpOutlet}dk` : `🌊 Qout: ${qOutletPeak} m³/s @ ${tpOutlet}min`}
                          </text>
                        </g>
                      </>
                    )}

                    {/* Curve 2: Clicked Cell */}
                    {(hydrographView === "cell" || hydrographView === "compare") && (
                      <>
                        <path d={areaDCell} fill="url(#mini-cell-grad)" />
                        <path
                          d={lineDCell}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <line
                          x1={peakXCell}
                          y1={peakYCell}
                          x2={peakXCell}
                          y2={hydroFloorY}
                          stroke="#0284c7"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                        />
                        <circle cx={peakXCell} cy={peakYCell} r={5} fill="#0284c7" stroke="var(--paper)" strokeWidth={1.5} />

                        {/* Left-Aligned Floating Badge for Clicked Cell */}
                        <g transform={`translate(${tagXCell}, ${tagYCell})`}>
                          <rect
                            x="0"
                            y="-9.5"
                            width={badgeW}
                            height={badgeH}
                            rx="4"
                            fill={isAtOutlet ? "#0f172a" : "var(--frame)"}
                            stroke="#0284c7"
                            strokeWidth={1}
                          />
                          <text x="6" y="4" textAnchor="start" fontSize="9" fontFamily="var(--font-ibm-plex-mono), monospace" fontWeight="bold" fill="#ffffff">
                            {isAtOutlet
                              ? (lang === "tr" ? `Qp: ${qCellPeak} m³/s (Çıkış)` : `Qp: ${qCellPeak} m³/s (Outlet)`)
                              : (lang === "tr" ? `📍 Qp: ${qCellPeak} m³/s @ ${tpCell}dk` : `📍 Qp: ${qCellPeak} m³/s @ ${tpCell}min`)}
                          </text>
                        </g>
                      </>
                    )}

                    {/* Time axis line along floor */}
                    <line
                      x1={padL}
                      y1={hydroFloorY}
                      x2={padL + plotW}
                      y2={hydroFloorY}
                      stroke="var(--ink)"
                      strokeWidth={1}
                    />
                    {[0, 20, 40, 60, 80, 100, 120].map((tVal) => {
                      const x = padL + (tVal / tMax) * plotW;
                      return (
                        <g key={`mini-t-${tVal}`}>
                          <line x1={x} y1={hydroFloorY} x2={x} y2={hydroFloorY + 5} stroke="var(--ink)" strokeWidth={1} />
                          <text
                            x={x}
                            y={hydroFloorY + 16}
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="var(--font-ibm-plex-mono), monospace"
                            fontWeight="600"
                            fill="var(--ink2)"
                          >
                            {tVal}
                          </text>
                        </g>
                      );
                    })}
                    <text
                      x={padL + plotW}
                      y={hydroFloorY + 28}
                      textAnchor="end"
                      fontSize="9"
                      fontFamily="var(--font-ibm-plex-mono), monospace"
                      fontWeight="600"
                      fill="var(--mut)"
                    >
                      {lang === "tr" ? "Zaman t (dakika)" : "Time t (min)"}
                    </text>
                  </svg>
                </div>
              );
            })()}

            {/* Footer Status & Parameter Summary */}
            <div className="text-[10px] sm:text-[10.5px] text-[var(--mut)] flex items-center justify-between border-t border-[var(--line)] pt-2 px-1">
              <span>💡 {lang === "tr" ? "Piksele tıklayarak hidrografı anında güncelleyin" : "Click any cell to update dynamically"}</span>
              <span className="font-mono font-bold text-sky-600">
                {lang === "tr" ? (
                  <>Q<sub>p</sub> = 4.375·A • C=0.45 • I=35 mm/sa • 1 hücre=1.0 km²</>
                ) : (
                  <>Q<sub>p</sub> = 4.375·A • C=0.45 • I=35 mm/h • 1 cell=1.0 km²</>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Clean & Understandable Legend & Map Key (Bilingual) (Directly Following Pixel Map) ── */}
      <div className="p-6 border-t-[1.5px] border-[var(--frame)] bg-[var(--atlas-card)] flex flex-col md:flex-row gap-8 items-start justify-between">
        {/* Left: Active Mode Specific Explanation */}
        <div className="flex-1">
          {mode === "dem" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-plex-mono text-[11px] font-semibold tracking-wider text-[var(--ink)] uppercase">
                  {t(p.demTitle, lang)}
                </span>
                <span className="font-plex-mono text-[10px] text-[var(--mut)]">
                  {t(p.demSubtitle, lang)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div
                  className="h-3 w-full rounded-sm border border-[var(--line)]"
                  style={{
                    background: `linear-gradient(to right, ${DEM_STOPS.map(
                      (c, i) => `${c} ${(i / (DEM_STOPS.length - 1)) * 100}%`
                    ).join(", ")})`,
                  }}
                />
                <div className="flex justify-between font-plex-mono text-[10px] text-[var(--ink2)]">
                  <span className="font-medium">{t(p.demMin, lang)}</span>
                  <span className="font-medium">{t(p.demMax, lang)}</span>
                </div>
              </div>
              <p className="font-display text-[12px] text-[var(--ink2)] leading-relaxed">
                {t(p.demDesc, lang)}
              </p>
            </div>
          )}

          {mode === "d8" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-plex-mono text-[11px] font-semibold tracking-wider text-[var(--ink)] uppercase">
                  {t(p.d8Title, lang)}
                </span>
                <span className="font-plex-mono text-[10px] text-[var(--mut)]">
                  {t(p.d8Subtitle, lang)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { dir: "NW" as Direction, label: "NW (315°)" },
                  { dir: "N" as Direction,  label: "N (0°)" },
                  { dir: "NE" as Direction, label: "NE (45°)" },
                  { dir: "W" as Direction,  label: "W (270°)" },
                  { dir: "E" as Direction,  label: "E (90°)" },
                  { dir: "SW" as Direction, label: "SW (225°)" },
                  { dir: "S" as Direction,  label: "S (180°)" },
                  { dir: "SE" as Direction, label: "SE (135°)" },
                ].map((item) => (
                  <div
                    key={item.dir}
                    className="flex items-center gap-2 p-2 bg-[var(--paper)] border border-[var(--line)] rounded-sm"
                  >
                    <span className="font-plex-mono text-[14px] font-bold text-[var(--acc)]">
                      {DIR_ARROW[item.dir]}
                    </span>
                    <span className="font-plex-mono text-[10px] font-semibold text-[var(--ink)]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="font-display text-[12px] text-[var(--ink2)] leading-relaxed">
                {t(p.d8Desc, lang)}
              </p>
            </div>
          )}

          {mode === "acc" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-plex-mono text-[11px] font-semibold tracking-wider text-[var(--ink)] uppercase">
                  {t(p.accTitle, lang)}
                </span>
                <span className="font-plex-mono text-[10px] text-[var(--mut)]">
                  {t(p.accSubtitle, lang)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div
                  className="h-3 w-full rounded-sm border border-[var(--line)]"
                  style={{
                    background: `linear-gradient(to right, ${ACC_STOPS.map(
                      (c, i) => `${c} ${(i / (ACC_STOPS.length - 1)) * 100}%`
                    ).join(", ")})`,
                  }}
                />
                <div className="flex justify-between font-plex-mono text-[10px] text-[var(--ink2)]">
                  <span className="font-medium">{t(p.accMin, lang)}</span>
                  <span className="font-medium">
                    {maxAcc} {t(p.accMax, lang)}
                  </span>
                </div>
              </div>
              <p className="font-display text-[12px] text-[var(--ink2)] leading-relaxed">
                {t(p.accDesc, lang)}
              </p>
            </div>
          )}
        </div>

        {/* Right: Permanent Map Symbols Key (Placed right next to DEM on mobile & desktop) */}
        <div className="w-full md:w-[330px] p-4 bg-[var(--paper)] border border-[var(--line)] rounded-sm flex flex-col gap-3 flex-none shadow-2xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--acc)]" />
              <span className="font-plex-mono text-[10px] font-bold tracking-wider text-[var(--ink)] uppercase">
                {t(p.mapKeyTitle, lang)}
              </span>
            </div>
            <span className="font-plex-mono text-[9px] text-[var(--mut)] uppercase font-semibold">
              {showDivide ? (lang === "tr" ? "Su Ayrımı" : "Divide Mode") : (lang === "tr" ? "Drenaj Ağı" : "Drainage")}
            </span>
          </div>

          {showDivide ? (
            /* Divide Mode Symbology: Shows Basin A, Basin B, Drainage Divide Ridge, and Water */
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <line x1="1" y1="12" x2="21" y2="12" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4 2.5" strokeLinecap="round" />
                  <polygon points="11,2 15,9 7,9" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">{t(p.divideLineLabel, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.divideLineDesc, lang)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <rect x="2" y="2" width="18" height="14" rx="2" fill="color-mix(in srgb, #38bdf8 25%, var(--atlas-card))" stroke="#0284c7" strokeWidth="1.2" />
                  <text x="11" y="12.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#0284c7" fontFamily="var(--font-ibm-plex-mono), monospace">A</text>
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold text-[#0284c7]">{t(p.basinA, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.basinADesc, lang)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <rect x="2" y="2" width="18" height="14" rx="2" fill="color-mix(in srgb, #a7f3d0 28%, var(--atlas-card))" stroke="#059669" strokeWidth="1.2" />
                  <text x="11" y="12.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#047857" fontFamily="var(--font-ibm-plex-mono), monospace">B</text>
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold text-emerald-600">{t(p.basinB, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.basinBDesc, lang)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <rect x="2" y="2" width="18" height="14" rx="2" fill="#38bdf8" stroke="rgba(2,132,199,0.4)" strokeWidth="1" />
                  <text x="11" y="12.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0369a1" fontFamily="sans-serif">≈</text>
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold">{t(p.waterSurface, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.waterSurfaceDesc, lang)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Delineation & Catchment Mode Symbology */
            <div className="flex flex-col gap-2.5">
              {/* Selected Pour Point */}
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <circle cx="11" cy="9" r="7.5" fill="none" stroke="#0284c7" strokeWidth="1.6" strokeOpacity="0.4" />
                  <circle cx="11" cy="9" r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold text-[#0284c7]">{t(p.pourPoint, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.pourPointDesc, lang)}</span>
                </div>
              </div>

              {/* Catchment Basin & Boundary */}
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <rect x="2" y="2" width="18" height="14" rx="2" fill="color-mix(in srgb, #0284c7 35%, var(--atlas-card))" stroke="#0284c7" strokeWidth="2.4" />
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold text-[var(--ink)]">{t(p.basin, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.basinDesc, lang)}</span>
                </div>
              </div>

              {/* Downstream Streamline */}
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <line x1="2" y1="9" x2="16" y2="9" stroke="#0284c7" strokeWidth="2.4" strokeDasharray="3.5 2.5" strokeLinecap="round" />
                  <circle cx="17.5" cy="9" r="2.8" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold text-[#0284c7]">{t(p.flowPath, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.flowPathDesc, lang)}</span>
                </div>
              </div>

              {/* Terminal Edge Outlet */}
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <rect x="2" y="2" width="18" height="14" rx="2" fill="var(--paper)" stroke="#0284c7" strokeWidth="1.6" />
                  <circle cx="11" cy="12" r="2.8" fill="var(--field)" />
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold">{t(p.edgeOutlet, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.edgeOutletDesc, lang)}</span>
                </div>
              </div>

              {/* Water Surface */}
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <rect x="2" y="2" width="18" height="14" rx="2" fill="#38bdf8" stroke="rgba(2,132,199,0.4)" strokeWidth="1" />
                  <text x="11" y="12.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0369a1" fontFamily="sans-serif">≈</text>
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold">{t(p.waterSurface, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.waterSurfaceDesc, lang)}</span>
                </div>
              </div>

              {/* Drainage Divide Ridge */}
              <div className="flex items-start gap-2.5">
                <svg width="22" height="18" viewBox="0 0 22 18" className="flex-none mt-0.5">
                  <line x1="1" y1="12" x2="21" y2="12" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4 2.5" strokeLinecap="round" />
                  <polygon points="11,2 15,9 7,9" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
                </svg>
                <div className="font-display text-[11px] text-[var(--ink)] leading-tight">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">{t(p.divideLineLabel, lang)}</span>
                  <span className="text-[var(--mut)] block text-[10px] mt-0.5">{t(p.divideLineDesc, lang)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Hydrological Hand-Calculation & Field Notes (Humanized Engineering Guide) ── */}
      {mode === "dem" && (
        <div className="px-4 sm:px-6 pb-6 bg-[var(--atlas-card)] w-full">
          <div className="bg-[var(--paper)] border-[1.5px] border-[var(--frame)] rounded-xl overflow-hidden shadow-[4px_4px_0_var(--shadow)] transition-all">
            {/* ── Header Bar ── */}
            <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--frame)]/5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--frame)] text-[var(--paper)] flex items-center justify-center shadow-xs flex-none">
                  <Calculator size={18} className="stroke-[2]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-plex-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--line)]/50 text-[var(--ink2)] border border-[var(--line)]">
                      {lang === "tr" ? "MÜHENDİSLİK NOTLARI" : "HYDROLOGY FIELD NOTES"}
                    </span>
                    {(() => {
                      const activeRow = clicked ? clicked[0] : terminalOutlet[0];
                      const activeCol = clicked ? clicked[1] : terminalOutlet[1];
                      return (
                        <span className="font-plex-mono text-[9px] px-2 py-0.5 rounded bg-[var(--paper)] border border-[var(--line)] text-[var(--mut)]">
                          {lang === "tr" ? "İncelenen Hücre" : "Inspected Pixel"}: [{activeRow + 1}, {activeCol + 1}]
                        </span>
                      );
                    })()}
                  </div>
                  <h4 className="font-display font-bold text-[14px] sm:text-[15px] text-[var(--ink)] mt-1 tracking-tight">
                    {lang === "tr"
                      ? "Pik Debi ve Akış Süreleri Nasıl Hesaplanıyor?"
                      : "Behind the Math: How Discharges & Travel Times Are Computed"}
                  </h4>
                  <p className="text-[11px] text-[var(--mut)] max-w-2xl leading-relaxed mt-0.5 font-display">
                    {lang === "tr"
                      ? "Bu simülatörde gördüğünüz değerler kapalı kutu bir tahmin değil; klasik su kaynakları mühendisliğinde kullanılan analitik denklemlerle üretilir. İsterseniz adımları takip edebilir veya kendi hesap makinenizle sağlamasını yapabilirsiniz."
                      : "The hydrograph curves and peak flows here aren't black-box estimates—they run on classic analytical water resources equations. Follow the steps below to verify how any cell's values can be derived by hand."}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => setShowCalculationGuide((prev) => !prev)}
                  className="cursor-pointer px-3 py-1.5 rounded-lg border border-[var(--line)] hover:bg-[var(--frame)] hover:text-[var(--paper)] text-[var(--ink2)] transition-all font-plex-mono text-[10.5px] font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  {showCalculationGuide ? (
                    <>
                      <ChevronUp size={13} />
                      <span>{lang === "tr" ? "Notları Gizle" : "Hide Notes"}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={13} />
                      <span>{lang === "tr" ? "Notları Göster" : "Show Notes"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {showCalculationGuide && (
              <div className="p-4 sm:p-5 flex flex-col gap-4">
                {/* ── Segmented Stage Tabs ── */}
                <div className="flex items-center gap-1.5 p-1 bg-[var(--frame)]/5 rounded-xl border border-[var(--line)] overflow-x-auto no-scrollbar">
                  {[
                    { id: "qp", labelTr: <>1. Pik Debi (Q<sub>p</sub>)</>, labelEn: <>1. Peak Discharge (Q<sub>p</sub>)</>, icon: Droplets, color: "text-sky-600 dark:text-sky-400" },
                    { id: "tc", labelTr: <>2. Akış Süreleri (T<sub>c</sub> & T<sub>mansap</sub>)</>, labelEn: <>2. Travel Times (T<sub>c</sub> & T<sub>downstream</sub>)</>, icon: Timer, color: "text-amber-600 dark:text-amber-400" },
                    { id: "hydrograph", labelTr: <>3. Hidrograf Eğrisi Q(t)</>, labelEn: <>3. Hydrograph Curve Q(t)</>, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400" },
                    { id: "sheet", labelTr: <>4. Canlı Sağlama (Aktif Hücre)</>, labelEn: <>4. Live Breakdown</>, icon: Calculator, color: "text-indigo-600 dark:text-indigo-400" },
                    { id: "all", labelTr: <>Tüm Adımlar</>, labelEn: <>Full Overview</>, icon: Layers, color: "text-[var(--ink)]" },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeGuideTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveGuideTab(tab.id as any)}
                        className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-plex-mono text-[10.5px] font-semibold transition-all whitespace-nowrap ${
                          isActive
                            ? "bg-[var(--paper)] text-[var(--ink)] shadow-2xs border border-[var(--line)]"
                            : "text-[var(--mut)] hover:text-[var(--ink)] hover:bg-[var(--paper)]/60"
                        }`}
                      >
                        <Icon size={13} className={isActive ? tab.color : "opacity-50"} />
                        <span>{lang === "tr" ? tab.labelTr : tab.labelEn}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active cell values */}
                {(() => {
                  const activeRow = clicked ? clicked[0] : terminalOutlet[0];
                  const activeCol = clicked ? clicked[1] : terminalOutlet[1];
                  const activeArea = clicked ? selectedArea : basinTotalArea;
                  const activeLUpstream = clicked ? maxUpstreamPathLen : maxOutletPathLen;
                  const activeTc = clicked ? tcCell : tcOutlet;
                  const activeQp = clicked ? qCellPeak : qOutletPeak;
                  const activeLDn = clicked ? drainagePath.length : 1;
                  const activeTDn = clicked ? travelTimeToOutlet : 0;

                  return (
                    <div className="space-y-4">
                      {/* ── TAB 1: Peak Discharge Qp (Rational Method) ── */}
                      {(activeGuideTab === "qp" || activeGuideTab === "all") && (
                        <div className="p-4 sm:p-5 rounded-xl border border-[var(--line)] bg-[var(--paper)]">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-plex-mono text-[10px] font-bold">
                                1
                              </span>
                              <h5 className="font-display font-bold text-[13px] sm:text-[14px] text-[var(--ink)]">
                                {lang === "tr" ? <>Rasyonel Metot ile Pik Debi Hesabı (Q<sub>p</sub>)</> : <>Peak Discharge via the Rational Method (Q<sub>p</sub>)</>}
                              </h5>
                            </div>
                            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
                              Q<sub>p</sub> = (C · I · A) / 3.6
                            </span>
                          </div>

                          <p className="text-[11.5px] text-[var(--ink2)] leading-relaxed mb-3 font-display">
                            {lang === "tr"
                              ? "Küçük havzalarda taşkın piki için inşaat ve hidroloji mühendisliğinde standart olarak Rasyonel Metot kullanılır. Bu arazide seçtiğimiz tasarım parametreleri şunlardır:"
                              : "The Rational Method is the established engineering standard for peak runoff estimation in small catchments. For this model, our design parameters are:"}
                          </p>

                          {/* 3 Parameter Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)]">
                              <div className="font-mono text-[12px] font-bold text-[var(--ink)]">
                                C = 0.45
                              </div>
                              <div className="text-[10px] text-[var(--mut)] mt-0.5">
                                {lang === "tr" ? "Yüzey Akış Katsayısı" : "Runoff Coefficient"}
                              </div>
                              <p className="text-[10px] text-[var(--ink2)] mt-1.5 leading-snug">
                                {lang === "tr"
                                  ? "Dağlık ve yarı kayalık arazi; düşen yağışın %45'inin yüzey akışına dönüştüğünü ifade eder."
                                  : "Mountainous, semi-rocky terrain where 45% of rainfall turns directly into surface runoff."}
                              </p>
                            </div>

                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)]">
                              <div className="font-mono text-[12px] font-bold text-[var(--ink)]">
                                I = 35 mm/sa
                              </div>
                              <div className="text-[10px] text-[var(--mut)] mt-0.5">
                                {lang === "tr" ? "Tasarım Yağış Şiddeti" : "Design Rainfall Intensity"}
                              </div>
                              <p className="text-[10px] text-[var(--ink2)] mt-1.5 leading-snug">
                                {lang === "tr"
                                  ? "Bölge için 10 yıllık yineleme süresine (T = 10 yıl) karşılık gelen kritik fırtına şiddeti."
                                  : "Critical design storm intensity corresponding to a 10-year recurrence interval (T = 10 yr)."}
                              </p>
                            </div>

                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)]">
                              <div className="font-mono text-[12px] font-bold text-[var(--ink)]">
                                A = {lang === "tr" ? "Hücre Sayısı" : "Cell Count"} × 1.0 km²
                              </div>
                              <div className="text-[10px] text-[var(--mut)] mt-0.5">
                                {lang === "tr" ? "Drenaj Alanı" : "Contributing Drainage Area"}
                              </div>
                              <p className="text-[10px] text-[var(--ink2)] mt-1.5 leading-snug">
                                {lang === "tr"
                                  ? "DEM ızgarasında her piksel 1000m × 1000m (1.0 km²) kabul edildiğinden alan doğrudan hücre sayısıdır."
                                  : "Each DEM raster cell measures 1000m × 1000m (1.0 km²), making total area equal to cell count."}
                              </p>
                            </div>
                          </div>

                          {/* How 4.375 is derived */}
                          <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)] text-[11px] text-[var(--ink2)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                              <span className="font-semibold text-[var(--ink)]">
                                {lang === "tr" ? "Neden 4.375 ile çarpıyoruz?" : "Why the 4.375 multiplier?"}
                              </span>{" "}
                              <span className="text-[var(--mut)]">
                                {lang === "tr"
                                  ? "Sabitleri formülde yerine koyduğumuzda: "
                                  : "Substituting our constants into the formula: "}
                              </span>
                              <code className="font-mono font-bold text-sky-600 dark:text-sky-400">
                                (0.45 × 35) / 3.6 = 4.375
                              </code>
                              <div className="text-[10px] text-[var(--mut)] mt-0.5">
                                {lang === "tr" ? (
                                  <>3.6 böleni, mm/sa ve km² birimlerini m³/s debiye dönüştüren SI katsayısıdır: 1 mm/sa × 1 km² = (10<sup>-3</sup> m / 3600 s) × 10<sup>6</sup> m² = 1 / 3.6 m³/s.</>
                                ) : (
                                  <>The 3.6 divisor is the exact SI unit conversion factor: 1 mm/h × 1 km² = (10<sup>-3</sup> m / 3600 s) × 10<sup>6</sup> m² = 1 / 3.6 m³/s.</>
                                )}
                              </div>
                            </div>

                            <div className="flex-none font-mono text-[12px] font-bold px-2.5 py-1 rounded bg-[var(--paper)] border border-[var(--line)] text-sky-700 dark:text-sky-300">
                              Q<sub>p</sub> = 4.375 × A
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── TAB 2: Time of Concentration Tc & Downstream Lag ── */}
                      {(activeGuideTab === "tc" || activeGuideTab === "all") && (
                        <div className="p-4 sm:p-5 rounded-xl border border-[var(--line)] bg-[var(--paper)]">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-plex-mono text-[10px] font-bold">
                                2
                              </span>
                              <h5 className="font-display font-bold text-[13px] sm:text-[14px] text-[var(--ink)]">
                                {lang === "tr" ? <>Toplanma Süresi ve Mansap İletimi (T<sub>c</sub> & T<sub>mansap</sub>)</> : <>Time of Concentration & Downstream Routing (T<sub>c</sub> & T<sub>downstream</sub>)</>}
                              </h5>
                            </div>
                            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
                              {lang === "tr" ? <>T<sub>c</sub> = max(8, L<sub>memba</sub> × 4.0 dk)</> : <>T<sub>c</sub> = max(8, L<sub>upstream</sub> × 4.0 min)</>}
                            </span>
                          </div>

                          <p className="text-[11.5px] text-[var(--ink2)] leading-relaxed mb-3 font-display">
                            {lang === "tr"
                              ? "Arazide su sonsuz bir hızla akmaz. Yağan yağmurun en uzak su ayrım çizgisinden (sırt) seçtiğiniz hücreye ve oradan mansaptaki nihai çıkışa varış süresi arazinin fiziksel boyutlarına bağlıdır:"
                              : "Water does not travel instantly. The time it takes for rainfall from the furthest watershed ridge to reach your cell—and continue downstream toward the outlet—depends on topography:"}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)] flex flex-col justify-between">
                              <div>
                                <div className="text-[10px] font-plex-mono uppercase text-[var(--mut)]">
                                  {lang === "tr" ? <>Memba Toplanma Süresi (T<sub>c</sub>)</> : <>Time of Concentration (T<sub>c</sub>)</>}
                                </div>
                                <div className="font-mono text-[14px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                                  {lang === "tr" ? <>T<sub>c</sub> = max(8, L<sub>memba</sub> × 4.0) dk</> : <>T<sub>c</sub> = max(8, L<sub>upstream</sub> × 4.0) min</>}
                                </div>
                                <p className="text-[10.5px] text-[var(--ink2)] mt-1.5 leading-relaxed font-display">
                                  {lang === "tr" ? (
                                    <>En uzak tepe hücresinden bu noktaya varış süresidir. Hidrografta zirveye ulaşma süresi T<sub>p</sub> = T<sub>c</sub> olarak alınır.</>
                                  ) : (
                                    <>Travel duration from the furthest ridge pixel. In the hydrograph, time to peak is T<sub>p</sub> = T<sub>c</sub>.</>
                                  )}
                                </p>
                              </div>
                              <div className="text-[9.5px] text-[var(--mut)] pt-2 border-t border-[var(--line)] mt-2">
                                {lang === "tr"
                                  ? "* En dik münferit tepe hücresinde dahi yüzey akışının toparlanması için 8 dakikalık taban süre uygulanır."
                                  : "* Even on a steep isolated hilltop, an 8-minute minimum overland flow baseline applies."}
                              </div>
                            </div>

                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)] flex flex-col justify-between">
                              <div>
                                <div className="text-[10px] font-plex-mono uppercase text-[var(--mut)]">
                                  {lang === "tr" ? <>Mansap Varış Gecikmesi (T<sub>mansap</sub>)</> : <>Downstream Outlet Travel Time (T<sub>downstream</sub>)</>}
                                </div>
                                <div className="font-mono text-[14px] font-bold text-[var(--ink)] mt-0.5">
                                  {lang === "tr" ? <>T<sub>mansap</sub> = (L<sub>mansap</sub> - 1) × 4.0 dk</> : <>T<sub>downstream</sub> = (L<sub>downstream</sub> - 1) × 4.0 min</>}
                                </div>
                                <p className="text-[10.5px] text-[var(--ink2)] mt-1.5 leading-relaxed font-display">
                                  {lang === "tr"
                                    ? "Bu hücrede oluşan taşkın dalgasının havzanın nihai dökülme noktasına (göl veya körfez) ulaşana kadar katettiği mansap ötelenme gecikmesidir."
                                    : "Hydrodynamic downstream routing lag before the local discharge wave reaches the terminal outlet (lake or bay)."}
                                </p>
                              </div>
                              <div className="text-[9.5px] text-[var(--mut)] pt-2 border-t border-[var(--line)] mt-2">
                                {lang === "tr"
                                  ? "* 1 km hücre / 4 dakika = ortalama 4.17 m/s taşkın dalga celerite hızı."
                                  : "* 1 km cell / 4 minutes = ~4.17 m/s average flood wave celerity."}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── TAB 3: Gamma Synthetic Hydrograph Q(t) ── */}
                      {(activeGuideTab === "hydrograph" || activeGuideTab === "all") && (
                        <div className="p-4 sm:p-5 rounded-xl border border-[var(--line)] bg-[var(--paper)]">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-plex-mono text-[10px] font-bold">
                                3
                              </span>
                              <h5 className="font-display font-bold text-[13px] sm:text-[14px] text-[var(--ink)]">
                                {lang === "tr" ? "Gamma Sentetik Hidrograf Denklemi" : "Continuous Gamma Synthetic Hydrograph"}
                              </h5>
                            </div>
                            <span className="font-plex-mono text-[10px] text-[var(--mut)]">
                              Q(t) = Q<sub>p</sub> · (t/T<sub>p</sub>)<sup>2.5</sup> · e<sup>-2.5(t/T<sub>p</sub> - 1)</sup>
                            </span>
                          </div>

                          <p className="text-[11.5px] text-[var(--ink2)] leading-relaxed mb-3 font-display">
                            {lang === "tr"
                              ? "Doğada akarsu debisi bir anda yükselip bıçak gibi sıfırlanmaz; zirveye ulaştıktan sonra kademeli bir sönümlenme eğrisi (çekilme kolu / recession limb) izler. Bu simülatörde kesintili üçgenler yerine sürekli analitik Gamma fonksiyonu kullanıyoruz:"
                              : "In nature, streamflow doesn't drop abruptly to zero after peak; it follows a gradual recession limb. Instead of crude discrete triangles, we compute a continuous analytical Gamma distribution:"}
                          </p>

                          <div className="p-3.5 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)] mb-3">
                            <div className="font-mono text-[13px] sm:text-[15px] font-bold text-emerald-700 dark:text-emerald-400 overflow-x-auto py-0.5">
                              Q(t) = Q<sub>p</sub> × (t / T<sub>p</sub>)<sup>2.5</sup> × exp[-2.5 × (t / T<sub>p</sub> - 1)]
                            </div>
                            <div className="text-[10px] text-[var(--mut)] mt-1.5 font-display">
                              {lang === "tr" ? (
                                <>Burada t geçen zamanı (dk), T<sub>p</sub> zirve anını (T<sub>c</sub>), Q<sub>p</sub> ise Rasyonel Metot pik debisini temsil eder. Denklemde t = T<sub>p</sub> yazıldığında (1)<sup>2.5</sup> × exp(0) = 1 kalır ve eğri tam olarak hesaplanan Q<sub>p</sub> değerine oturur.</>
                              ) : (
                                <>Where t is elapsed time (min), T<sub>p</sub> is time to peak (T<sub>c</sub>), and Q<sub>p</sub> is peak discharge. When t = T<sub>p</sub>, the term evaluates to (1)<sup>2.5</sup> × exp(0) = 1, ensuring mathematical consistency with peak discharge.</>
                              )}
                            </div>
                          </div>

                          {/* Key Milestones */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                            <div className="p-2.5 bg-[var(--atlas-card)] rounded border border-[var(--line)]">
                              <span className="text-[9px] text-[var(--mut)] block">t = 0 {lang === "tr" ? "dk" : "min"}</span>
                              <span className="font-bold text-[var(--ink)]">Q = 0.0 m³/s</span>
                              <span className="text-[9px] text-[var(--mut)] block mt-0.5">{lang === "tr" ? "Yağış Başlangıcı" : "Storm onset"}</span>
                            </div>
                            <div className="p-2.5 bg-emerald-500/10 rounded border border-emerald-500/30">
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-bold">t = T<sub>p</sub> ({lang === "tr" ? "Zirve" : "Peak"})</span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-300 text-[12px]">Q = Q<sub>p</sub></span>
                              <span className="text-[9px] text-emerald-600/80 block mt-0.5">{lang === "tr" ? "Maksimum Debi" : "Peak discharge"}</span>
                            </div>
                            <div className="p-2.5 bg-[var(--atlas-card)] rounded border border-[var(--line)]">
                              <span className="text-[9px] text-[var(--mut)] block">t = 2.0 × T<sub>p</sub></span>
                              <span className="font-bold text-[var(--ink)]">Q ≈ 0.36 × Q<sub>p</sub></span>
                              <span className="text-[9px] text-[var(--mut)] block mt-0.5">{lang === "tr" ? "Çekilme Kolu" : "Recession"}</span>
                            </div>
                            <div className="p-2.5 bg-[var(--atlas-card)] rounded border border-[var(--line)]">
                              <span className="text-[9px] text-[var(--mut)] block">t = 3.0 × T<sub>p</sub></span>
                              <span className="font-bold text-[var(--ink)]">Q ≈ 0.04 × Q<sub>p</sub></span>
                              <span className="text-[9px] text-[var(--mut)] block mt-0.5">{lang === "tr" ? "Doğal Sönümlenme" : "Base flow return"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── TAB 4: Live Dynamic Calculation Sheet ── */}
                      {(activeGuideTab === "sheet" || activeGuideTab === "all") && (
                        <div className="p-4 sm:p-5 rounded-xl border border-[var(--line)] bg-[var(--paper)]">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-plex-mono text-[10px] font-bold">
                                4
                              </span>
                              <div>
                                <h5 className="font-display font-bold text-[13px] sm:text-[14px] text-[var(--ink)]">
                                  {lang === "tr"
                                    ? `Aktif Hücre İçin Canlı Hesap Özeti: [Satır ${activeRow + 1}, Sütun ${activeCol + 1}]`
                                    : `Live Calculation Breakdown: [Row ${activeRow + 1}, Col ${activeCol + 1}]`}
                                </h5>
                              </div>
                            </div>
                            <span className="text-[10px] font-plex-mono text-[var(--mut)]">
                              {!clicked
                                ? (lang === "tr" ? "(Havza Çıkış Noktası Referansı)" : "(Basin Outlet Reference)")
                                : (lang === "tr" ? "(Tıkladığınız Hücrenin Verileri)" : "(Your Clicked Pixel)")}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3 font-mono">
                            {/* Card 1: Area */}
                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)]">
                              <div className="text-[9.5px] uppercase text-[var(--mut)]">
                                {lang === "tr" ? "Drenaj Alanı (A)" : "Drainage Area (A)"}
                              </div>
                              <div className="text-[13px] font-bold text-[var(--ink)] mt-1">
                                {activeArea} {lang === "tr" ? "hücre" : "cells"} × 1.0 km²
                              </div>
                              <div className="text-[11.5px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                                = {activeArea}.0 km²
                              </div>
                            </div>

                            {/* Card 2: Qp */}
                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)]">
                              <div className="text-[9.5px] uppercase text-[var(--mut)]">
                                {lang === "tr" ? <>Pik Debi (Q<sub>p</sub>)</> : <>Peak Discharge (Q<sub>p</sub>)</>}
                              </div>
                              <div className="text-[11.5px] text-[var(--ink2)] mt-1">
                                4.375 × {activeArea} km²
                              </div>
                              <div className="text-[13.5px] text-sky-600 dark:text-sky-400 font-bold mt-0.5">
                                = {activeQp} m³/s
                              </div>
                            </div>

                            {/* Card 3: Tc */}
                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)]">
                              <div className="text-[9.5px] uppercase text-[var(--mut)]">
                                {lang === "tr" ? <>Toplanma Süresi (T<sub>c</sub>)</> : <>Time of Conc. (T<sub>c</sub>)</>}
                              </div>
                              <div className="text-[11.5px] text-[var(--ink2)] mt-1">
                                max(8, {activeLUpstream} × 4.0)
                              </div>
                              <div className="text-[13.5px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                                = {activeTc} {lang === "tr" ? "dakika" : "min"}
                              </div>
                            </div>

                            {/* Card 4: Downstream */}
                            <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)]">
                              <div className="text-[9.5px] uppercase text-[var(--mut)]">
                                {lang === "tr" ? <>Mansap Varış (T<sub>mansap</sub>)</> : <>Downstream Travel (T<sub>downstream</sub>)</>}
                              </div>
                              <div className="text-[11.5px] text-[var(--ink2)] mt-1">
                                ({activeLDn} - 1) × 4.0 {lang === "tr" ? "dk" : "min"}
                              </div>
                              <div className="text-[13.5px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                = {activeTDn} {lang === "tr" ? "dakika" : "min"}
                              </div>
                            </div>
                          </div>

                          {/* Sanity Check Note */}
                          <div className="p-3 bg-[var(--atlas-card)] rounded-lg border border-[var(--line)] flex items-start sm:items-center justify-between gap-3 text-[11px] font-display text-[var(--ink2)]">
                            <div>
                              <span className="font-semibold text-[var(--ink)]">
                                {lang === "tr" ? "Hesap makinesi sağlaması:" : "Quick calculator sanity check:"}
                              </span>{" "}
                              <span>
                                {lang === "tr" ? (
                                  <>Hesap makinenizde 4.375 ile {activeArea} değerini çarptığınızda ekranda gördüğünüz {activeQp} m³/s pik debi (Q<sub>p</sub>) değerini birebir elde edersiniz.</>
                                ) : (
                                  <>If you multiply 4.375 by {activeArea} on your calculator, you will get the exact {activeQp} m³/s peak discharge (Q<sub>p</sub>) displayed above.</>
                                )}
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold flex-none">
                              Q<sub>p</sub>: {activeQp} m³/s
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


