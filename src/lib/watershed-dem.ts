/**
 * Synthetic teaching terrain for the watershed lab: a 15 × 12 DEM (1 km cells)
 * with two catchments that drain to a lake (west) and a bay (east) on the
 * bottom edge. Water cells sit at 0 m.
 */
import { computeD8, computeFlowAccumulation, type D8Grid, type Direction } from "./watershed";

export const DEM: number[][] = [
  [410, 435, 450, 465, 478, 492, 498, 485, 470, 455, 440, 430, 445, 460, 440],
  [385, 395, 415, 438, 452, 470, 482, 468, 445, 418, 405, 398, 412, 435, 415],
  [355, 345, 375, 405, 420, 445, 460, 446, 415, 372, 365, 360, 375, 405, 385],
  [320, 290, 330, 365, 385, 415, 435, 420, 380, 325, 320, 315, 335, 370, 350],
  [280, 235, 275, 320, 255, 380, 405, 390, 340, 270, 275, 265, 290, 330, 310],
  [240, 195, 180, 235, 220, 340, 370, 355, 295, 225, 215, 218, 245, 285, 265],
  [195, 155, 130, 185, 205, 295, 330, 315, 250, 185, 175, 165, 195, 235, 215],
  [150, 115, 90, 140, 175, 245, 285, 270, 205, 145, 130, 120, 145, 185, 165],
  [110, 80, 68, 60, 125, 190, 235, 220, 160, 108, 92, 80, 95, 135, 118],
  [75, 52, 44, 36, 78, 135, 180, 168, 118, 75, 62, 50, 55, 85, 75],
  [45, 30, 0, 0, 28, 82, 125, 115, 78, 48, 32, 0, 0, 48, 42],
  [28, 18, 0, 0, 0, 45, 75, 68, 42, 28, 14, 0, 0, 0, 22],
];

export const ROWS = DEM.length;
export const COLS = DEM[0].length;
export const CELL_KM = 1;
export const MAX_ELEV = 498;

export const WATER_CELLS = new Set([
  "10,2", "10,3", "11,2", "11,3", "11,4", // Lake (west)
  "10,11", "10,12", "11,11", "11,12", "11,13", // Bay (east)
]);

export const WEST_OUTLET: [number, number] = [11, 3];
export const EAST_OUTLET: [number, number] = [11, 12];

export const key = (r: number, c: number) => `${r},${c}`;

/**
 * D8 on the DEM, with the flat water cells routed to their outlet cell
 * (flat surfaces have no downhill neighbour, so plain D8 would leave them as sinks).
 */
export function computeTerrainD8(): D8Grid {
  const d8 = computeD8(DEM);
  for (const k of WATER_CELLS) {
    const [r, c] = k.split(",").map(Number);
    const outlet = c <= 5 ? WEST_OUTLET : EAST_OUTLET;
    if (r === outlet[0] && c === outlet[1]) {
      d8[r][c] = "SINK";
      continue;
    }
    const dr = Math.sign(outlet[0] - r);
    const dc = Math.sign(outlet[1] - c);
    const map: Record<string, Direction> = {
      "1,0": "S", "1,1": "SE", "1,-1": "SW", "0,1": "E", "0,-1": "W",
    };
    d8[r][c] = map[`${dr},${dc}`] ?? d8[r][c];
  }
  return d8;
}

export const D8_GRID = computeTerrainD8();
export const ACC_GRID = computeFlowAccumulation(DEM, D8_GRID);
export const MAX_ACC = Math.max(...ACC_GRID.flat());

const NEIGHBOURS: { dir: Direction; dr: number; dc: number }[] = [
  { dir: "NW", dr: -1, dc: -1 }, { dir: "N", dr: -1, dc: 0 }, { dir: "NE", dr: -1, dc: 1 },
  { dir: "W", dr: 0, dc: -1 }, { dir: "E", dr: 0, dc: 1 },
  { dir: "SW", dr: 1, dc: -1 }, { dir: "S", dr: 1, dc: 0 }, { dir: "SE", dr: 1, dc: 1 },
];

export interface NeighbourInfo {
  dir: Direction;
  r: number;
  c: number;
  elev: number | null; // null = outside the map
  drop: number; // m (positive = downhill)
  distKm: number;
  slope: number; // m per km
}

/** The 8 neighbours of a cell with the drop and slope D8 compares (row-major, centre omitted). */
export function neighbourSlopes(r: number, c: number): NeighbourInfo[] {
  return NEIGHBOURS.map(({ dir, dr, dc }) => {
    const nr = r + dr;
    const nc = c + dc;
    const inside = nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS;
    const distKm = (dr !== 0 && dc !== 0 ? Math.SQRT2 : 1) * CELL_KM;
    const elev = inside ? DEM[nr][nc] : null;
    const drop = elev === null ? 0 : DEM[r][c] - elev;
    return { dir, r: nr, c: nc, elev, drop, distKm, slope: drop / distKm };
  });
}

export const DIR_NAME: Record<Direction, { en: string; tr: string }> = {
  N: { en: "north", tr: "kuzey" },
  NE: { en: "north-east", tr: "kuzeydoğu" },
  E: { en: "east", tr: "doğu" },
  SE: { en: "south-east", tr: "güneydoğu" },
  S: { en: "south", tr: "güney" },
  SW: { en: "south-west", tr: "güneybatı" },
  W: { en: "west", tr: "batı" },
  NW: { en: "north-west", tr: "kuzeybatı" },
  SINK: { en: "nowhere (outlet)", tr: "hiçbir yere (çıkış)" },
};
