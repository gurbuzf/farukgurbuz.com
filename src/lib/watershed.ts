/**
 * watershed.ts — Pure TypeScript D8 watershed hydrology utilities.
 *
 * Implements D8 (deterministic 8-direction) flow routing:
 *   - Flow direction: each cell drains to its steepest downslope neighbour
 *   - Flow accumulation: count of upstream cells draining through each cell
 *   - Path tracing: downstream path from any cell to the basin outlet
 *   - Upstream tracing: all cells that drain into a given cell
 */

export type Direction =
  | "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "SINK";

export type D8Grid = Direction[][];
export type AccGrid = number[][];

/** [dRow, dCol] deltas for each direction */
const DIR_DELTA: Record<Direction, [number, number]> = {
  N:    [-1,  0],
  NE:   [-1,  1],
  E:    [ 0,  1],
  SE:   [ 1,  1],
  S:    [ 1,  0],
  SW:   [ 1, -1],
  W:    [ 0, -1],
  NW:   [-1, -1],
  SINK: [ 0,  0],
};

/** Diagonal cells travel farther — weight by √2 for slope comparison */
const DIAGONAL_DIRS = new Set<Direction>(["NE", "SE", "SW", "NW"]);

const DIRECTIONS: Direction[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function inBounds(rows: number, cols: number, r: number, c: number) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

/**
 * Compute D8 flow direction for each cell in the DEM.
 * Each cell drains to its steepest-descent neighbour (by slope = Δelev / distance).
 * Cells with no downslope neighbour are marked SINK.
 */
export function computeD8(dem: number[][]): D8Grid {
  const rows = dem.length;
  const cols = dem[0].length;
  const d8: D8Grid = Array.from({ length: rows }, () =>
    Array(cols).fill("SINK" as Direction)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let maxSlope = 0;
      let bestDir: Direction = "SINK";

      for (const dir of DIRECTIONS) {
        const [dr, dc] = DIR_DELTA[dir];
        const nr = r + dr;
        const nc = c + dc;
        if (!inBounds(rows, cols, nr, nc)) continue;
        const drop = dem[r][c] - dem[nr][nc];
        if (drop <= 0) continue;
        const dist = DIAGONAL_DIRS.has(dir) ? Math.SQRT2 : 1;
        const slope = drop / dist;
        if (slope > maxSlope) {
          maxSlope = slope;
          bestDir = dir;
        }
      }

      d8[r][c] = bestDir;
    }
  }

  return d8;
}

/**
 * Compute flow accumulation: for each cell, count how many cells
 * (including itself) drain through it. Uses topological sort.
 */
export function computeFlowAccumulation(
  dem: number[][],
  d8: D8Grid
): AccGrid {
  const rows = dem.length;
  const cols = dem[0].length;

  // In-degree count (how many cells point TO each cell)
  const inDegree: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dir = d8[r][c];
      if (dir === "SINK") continue;
      const [dr, dc] = DIR_DELTA[dir];
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(rows, cols, nr, nc)) {
        inDegree[nr][nc]++;
      }
    }
  }

  // Accumulation starts at 1 for each cell (itself)
  const acc: AccGrid = Array.from({ length: rows }, () =>
    Array(cols).fill(1)
  );

  // Kahn's algorithm — start from cells with no upstream contributors
  const queue: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (inDegree[r][c] === 0) queue.push([r, c]);
    }
  }

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const dir = d8[r][c];
    if (dir === "SINK") continue;
    const [dr, dc] = DIR_DELTA[dir];
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(rows, cols, nr, nc)) continue;
    acc[nr][nc] += acc[r][c];
    inDegree[nr][nc]--;
    if (inDegree[nr][nc] === 0) queue.push([nr, nc]);
  }

  return acc;
}

/**
 * Trace the downstream drainage path from (row, col) to the basin outlet.
 * Returns an ordered array of [row, col] pairs, inclusive of the start cell.
 */
export function traceDrainagePath(
  d8: D8Grid,
  row: number,
  col: number
): [number, number][] {
  const rows = d8.length;
  const cols = d8[0].length;
  const path: [number, number][] = [];
  const visited = new Set<string>();

  let r = row;
  let c = col;

  while (true) {
    const key = `${r},${c}`;
    if (visited.has(key)) break; // cycle guard
    visited.add(key);
    path.push([r, c]);

    const dir = d8[r][c];
    if (dir === "SINK") break;
    const [dr, dc] = DIR_DELTA[dir];
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(rows, cols, nr, nc)) break;
    r = nr;
    c = nc;
  }

  return path;
}

/**
 * Find all cells upstream of (row, col) — i.e., every cell whose
 * drainage path passes through (row, col). Returns a Set of "r,c" keys.
 */
export function findUpstreamCells(
  d8: D8Grid,
  row: number,
  col: number
): Set<string> {
  const rows = d8.length;
  const cols = d8[0].length;

  // Build reverse graph
  const upstream: Map<string, [number, number][]> = new Map();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dir = d8[r][c];
      if (dir === "SINK") continue;
      const [dr, dc] = DIR_DELTA[dir];
      const nr = r + dr;
      const nc = c + dc;
      if (!inBounds(rows, cols, nr, nc)) continue;
      const key = `${nr},${nc}`;
      if (!upstream.has(key)) upstream.set(key, []);
      upstream.get(key)!.push([r, c]);
    }
  }

  // BFS from the target cell backwards
  const result = new Set<string>();
  const queue: [number, number][] = [[row, col]];
  const visited = new Set<string>([`${row},${col}`]);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const contributors = upstream.get(`${r},${c}`) ?? [];
    for (const [ur, uc] of contributors) {
      const key = `${ur},${uc}`;
      if (!visited.has(key)) {
        visited.add(key);
        result.add(key);
        queue.push([ur, uc]);
      }
    }
  }

  return result;
}

/** Arrow Unicode for each D8 direction */
export const DIR_ARROW: Record<Direction, string> = {
  N:    "↑",
  NE:   "↗",
  E:    "→",
  SE:   "↘",
  S:    "↓",
  SW:   "↙",
  W:    "←",
  NW:   "↖",
  SINK: "●",
};

/** SVG [dx, dy] unit vector for drawing direction arrow lines */
export const DIR_VECTOR: Record<Direction, [number, number]> = {
  N:    [ 0, -1],
  NE:   [ 1, -1],
  E:    [ 1,  0],
  SE:   [ 1,  1],
  S:    [ 0,  1],
  SW:   [-1,  1],
  W:    [-1,  0],
  NW:   [-1, -1],
  SINK: [ 0,  0],
};
