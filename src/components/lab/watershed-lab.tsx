"use client";

import { useCallback, useMemo, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useAtlas } from "@/lib/atlas-provider";
import { findUpstreamCells, traceDrainagePath, DIR_VECTOR, type Direction } from "@/lib/watershed";
import {
  ACC_GRID,
  COLS,
  D8_GRID,
  DEM,
  DIR_NAME,
  EAST_OUTLET,
  MAX_ACC,
  MAX_ELEV,
  ROWS,
  WATER_CELLS,
  WEST_OUTLET,
  key,
  neighbourSlopes,
} from "@/lib/watershed-dem";
import {
  ChangeNote,
  ChapterNav,
  Formula,
  LessonPanel,
  Manual,
  Segmented,
  Slider,
  fmt,
  useTx,
  type Change,
} from "./lab-kit";

type Cell = [number, number];

const CELL_W = 40;
const CELL_H = 34;
const MAP_W = COLS * CELL_W;
const MAP_H = ROWS * CELL_H;

const CHAPTERS = [
  { en: "Terrain", tr: "Arazi" },
  { en: "Flow direction", tr: "Akış yönü" },
  { en: "Flow path", tr: "Akış yolu" },
  { en: "Flow accumulation", tr: "Akış birikimi" },
  { en: "Watershed", tr: "Havza" },
  { en: "Peak flow", tr: "Pik debi" },
];

const LAND_COVER = [
  { id: "forest", c: 0.15, en: "Forest", tr: "Orman" },
  { id: "grass", c: 0.3, en: "Grassland", tr: "Çayır" },
  { id: "farm", c: 0.45, en: "Farmland", tr: "Tarım" },
  { id: "suburb", c: 0.6, en: "Suburbs", tr: "Banliyö" },
  { id: "city", c: 0.85, en: "City", tr: "Şehir" },
] as const;
type CoverId = (typeof LAND_COVER)[number]["id"];

// ── Pre-computed terrain facts ────────────────────────────────────────

/** Which outlet each cell finally drains to. */
const BASIN_OF: Map<string, "W" | "E"> = (() => {
  const m = new Map<string, "W" | "E">();
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const p = traceDrainagePath(D8_GRID, r, c);
      const end = p[p.length - 1];
      m.set(key(r, c), end[0] === WEST_OUTLET[0] && end[1] === WEST_OUTLET[1] ? "W" : "E");
    }
  return m;
})();

/** Grid edges between the two basins = the drainage divide. */
const DIVIDE_SEGMENTS = (() => {
  const segs: [number, number, number, number][] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const b = BASIN_OF.get(key(r, c));
      if (c + 1 < COLS && BASIN_OF.get(key(r, c + 1)) !== b)
        segs.push([(c + 1) * CELL_W, r * CELL_H, (c + 1) * CELL_W, (r + 1) * CELL_H]);
      if (r + 1 < ROWS && BASIN_OF.get(key(r + 1, c)) !== b)
        segs.push([c * CELL_W, (r + 1) * CELL_H, (c + 1) * CELL_W, (r + 1) * CELL_H]);
    }
  return segs;
})();

/** A cell whose lowest neighbour is diagonal but loses to a straight neighbour (distance matters!). */
const DISTANCE_EXAMPLE: Cell | null = (() => {
  for (let r = 1; r < ROWS - 1; r++)
    for (let c = 1; c < COLS - 1; c++) {
      if (WATER_CELLS.has(key(r, c))) continue;
      const n = neighbourSlopes(r, c).filter((x) => x.elev !== null);
      const lowest = n.reduce((a, b) => (b.drop > a.drop ? b : a));
      const steepest = n.reduce((a, b) => (b.slope > a.slope ? b : a));
      if (lowest.drop > 0 && lowest.dir !== steepest.dir) return [r, c];
    }
  return null;
})();

function catchmentOf(cell: Cell): Set<string> {
  const s = findUpstreamCells(D8_GRID, cell[0], cell[1]);
  s.add(key(cell[0], cell[1]));
  return s;
}

function longestPathTo(cell: Cell, basin: Set<string>): number {
  let best = 0;
  basin.forEach((k) => {
    const [r, c] = k.split(",").map(Number);
    const p = traceDrainagePath(D8_GRID, r, c);
    const i = p.findIndex(([pr, pc]) => pr === cell[0] && pc === cell[1]);
    if (i > best) best = i;
  });
  return best;
}

const outletName = (cell: Cell, tx: (en: string, tr: string) => string) =>
  BASIN_OF.get(key(cell[0], cell[1])) === "W" ? tx("the lake (west)", "göle (batı)") : tx("the bay (east)", "körfeze (doğu)");

// ── Reduced motion ────────────────────────────────────────────────────

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true
  );

// ── Lab ───────────────────────────────────────────────────────────────

export function WatershedLab() {
  const tx = useTx();
  const { lang } = useAtlas();
  const [chapter, setChapter] = useState(0);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [showArrows, setShowArrows] = useState(true);
  const [showDivide, setShowDivide] = useState(false);
  const [threshold, setThreshold] = useState(8);
  const [cover, setCover] = useState<CoverId>("grass");
  const [intensity, setIntensity] = useState(30);
  const [change, setChange] = useState<Change | null>(null);

  const goTo = (i: number) => {
    // Keep the clicked cell while it still makes sense (terrain → direction → path → accumulation);
    // the watershed chapters start fresh with a pour point of their own.
    if (i >= 4 && chapter < 4) setSelected(null);
    setChapter(i);
    setChange(null);
    document.getElementById("lab-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Chapters 5–6 need a pour point: default to the western lake outlet.
  const pourPoint: Cell | null = chapter >= 4 ? selected ?? (chapter === 5 ? WEST_OUTLET : null) : selected;
  const basin = useMemo(() => (pourPoint && chapter >= 4 ? catchmentOf(pourPoint) : null), [pourPoint, chapter]);
  const path = useMemo(() => (selected && chapter === 2 ? traceDrainagePath(D8_GRID, selected[0], selected[1]) : null), [selected, chapter]);
  const riverCount = useMemo(() => ACC_GRID.flat().filter((a) => a >= threshold).length, [threshold]);

  const coverObj = LAND_COVER.find((l) => l.id === cover)!;
  const area = basin ? basin.size : 0;
  const peakQ = (coverObj.c * intensity * area) / 3.6;

  const select = useCallback(
    (cell: Cell) => {
      if (chapter === 4 || chapter === 5) {
        const prev = selected ?? (chapter === 5 ? WEST_OUTLET : null);
        if (prev && (prev[0] !== cell[0] || prev[1] !== cell[1])) {
          const a0 = catchmentOf(prev).size;
          const a1 = catchmentOf(cell).size;
          const effects: Change["effects"] = [{ label: tx("Catchment area", "Havza alanı"), from: a0, to: a1, unit: "km²", decimals: 0 }];
          if (chapter === 5)
            effects.push({
              label: tx("Peak flow Q", "Pik debi Q"),
              from: (coverObj.c * intensity * a0) / 3.6,
              to: (coverObj.c * intensity * a1) / 3.6,
              unit: "m³/s",
            });
          setChange({
            cause: tx("the pour point", "çıkış noktası"),
            from: `(${prev[0] + 1}, ${prev[1] + 1})`,
            to: `(${cell[0] + 1}, ${cell[1] + 1})`,
            effects,
          });
        }
      }
      setSelected(cell);
    },
    [chapter, selected, tx, coverObj.c, intensity]
  );

  const changeThreshold = (v: number) => {
    const before = ACC_GRID.flat().filter((a) => a >= threshold).length;
    const after = ACC_GRID.flat().filter((a) => a >= v).length;
    setChange({
      cause: tx("the river threshold", "akarsu eşiği"),
      from: `${threshold}`,
      to: `${v}`,
      effects: [{ label: tx("River cells", "Akarsu hücresi"), from: before, to: after, unit: tx("cells", "hücre"), decimals: 0 }],
    });
    setThreshold(v);
  };

  const changeCover = (id: CoverId) => {
    const c0 = coverObj.c;
    const c1 = LAND_COVER.find((l) => l.id === id)!.c;
    setChange({
      cause: tx("land cover (C)", "arazi örtüsü (C)"),
      from: `${tx(coverObj.en, coverObj.tr)} ${c0}`,
      to: `${tx(LAND_COVER.find((l) => l.id === id)!.en, LAND_COVER.find((l) => l.id === id)!.tr)} ${c1}`,
      effects: [{ label: tx("Peak flow Q", "Pik debi Q"), from: (c0 * intensity * area) / 3.6, to: (c1 * intensity * area) / 3.6, unit: "m³/s" }],
    });
    setCover(id);
  };

  const changeIntensity = (v: number) => {
    setChange({
      cause: tx("rain intensity (I)", "yağış şiddeti (I)"),
      from: `${intensity} mm/h`,
      to: `${v} mm/h`,
      effects: [{ label: tx("Peak flow Q", "Pik debi Q"), from: (coverObj.c * intensity * area) / 3.6, to: (coverObj.c * v * area) / 3.6, unit: "m³/s" }],
    });
    setIntensity(v);
  };

  // ── Chapter content ──────────────────────────────────────────────
  const sel = selected;
  const selLabel = sel ? `(${tx("row", "satır")} ${sel[0] + 1}, ${tx("col", "sütun")} ${sel[1] + 1})` : "";
  const clickHint = <p>{tx("Click any cell on the map to begin.", "Başlamak için haritada herhangi bir hücreye tıklayın.")}</p>;

  let title = "";
  let idea: React.ReactNode = null;
  let controls: React.ReactNode = null;
  let tryThis: React.ReactNode[] = [];
  let observe: React.ReactNode = null;

  if (chapter === 0) {
    title = tx("Terrain: a grid of heights", "Arazi: yüksekliklerden oluşan bir ızgara");
    idea = (
      <>
        <p>
          {tx(
            "A digital elevation model (DEM) stores the ground height of every cell in a grid. Here each cell is 1 km × 1 km and its number is the height above sea level in metres.",
            "Sayısal yükseklik modeli (DEM), ızgaradaki her hücrenin zemin yüksekliğini saklar. Burada her hücre 1 km × 1 km'dir ve üzerindeki sayı deniz seviyesinden yüksekliğidir (metre)."
          )}
        </p>
        <p>
          <strong>{tx("Water always flows downhill", "Su daima yokuş aşağı akar")}</strong>
          {tx(" — so the heights alone decide where rain will go.", " — bu yüzden yağmurun nereye gideceğine yalnızca yükseklikler karar verir.")}
        </p>
      </>
    );
    controls = sel ? <NeighbourGrid cell={sel} mode="elev" /> : null;
    tryThis = [
      tx("Click a cell on the high ridge at the top (≈ 480 m).", "Üstteki yüksek sırtta bir hücreye tıklayın (≈ 480 m)."),
      tx("Click a cell in a valley and compare its neighbours.", "Bir vadideki hücreye tıklayıp komşularını karşılaştırın."),
      tx("Find the lake (west) and the bay (east) at 0 m — every raindrop ends up there.", "0 m'deki gölü (batı) ve körfezi (doğu) bulun — her yağmur damlası sonunda oraya ulaşır."),
    ];
    if (sel) {
      const n = neighbourSlopes(sel[0], sel[1]).filter((x) => x.elev !== null);
      const lower = n.filter((x) => x.drop > 0);
      const lowest = n.reduce((a, b) => (b.elev! < a.elev! ? b : a));
      observe = WATER_CELLS.has(key(sel[0], sel[1])) ? (
        <p>{tx(`Cell ${selLabel} is water at 0 m — the end of the journey.`, `${selLabel} hücresi 0 m'de su yüzeyidir — yolculuğun sonu.`)}</p>
      ) : (
        <p>
          {tx(
            `Cell ${selLabel} is ${DEM[sel[0]][sel[1]]} m high. ${lower.length} of its ${n.length} neighbours are lower, so water could leave it in ${lower.length} directions. The lowest neighbour is ${lowest.elev} m, to the ${DIR_NAME[lowest.dir].en}. Which way does it actually go? That is the next chapter.`,
            `${selLabel} hücresi ${DEM[sel[0]][sel[1]]} m yüksekliğinde. ${n.length} komşusundan ${lower.length} tanesi daha alçak; yani su ${lower.length} yöne gidebilir. En alçak komşu ${DIR_NAME[lowest.dir].tr} yönünde, ${lowest.elev} m. Su gerçekte hangi yöne gider? Bu, sonraki bölümün konusu.`
          )}
        </p>
      );
    } else observe = clickHint;
  }

  if (chapter === 1) {
    title = tx("Flow direction: the steepest way down (D8)", "Akış yönü: en dik iniş (D8)");
    idea = (
      <>
        <p>
          {tx(
            "D8 (“deterministic eight”) sends all the water of a cell to one of its 8 neighbours: the one with the steepest downhill slope.",
            "D8 (“deterministik sekiz”) yöntemi, bir hücredeki suyun tamamını 8 komşusundan birine gönderir: yokuş aşağı eğimi en dik olana."
          )}
        </p>
        <Formula>
          {tx("slope = drop ÷ distance", "eğim = düşü ÷ mesafe")}
          <br />
          {tx("straight neighbour: 1 km · diagonal: √2 ≈ 1.41 km", "düz komşu: 1 km · çapraz komşu: √2 ≈ 1,41 km")}
        </Formula>
        <p>
          {tx(
            "Because diagonal neighbours are farther away, they need a bigger drop to win.",
            "Çapraz komşular daha uzakta olduğu için kazanmaları için daha büyük bir düşü gerekir."
          )}
        </p>
      </>
    );
    controls = (
      <>
        <Toggle checked={showArrows} onChange={setShowArrows} label={tx("Show the flow arrow of every cell", "Her hücrenin akış okunu göster")} />
        {sel && <NeighbourGrid cell={sel} mode="slope" />}
      </>
    );
    tryThis = [
      tx("Click a cell and check in the table which neighbour wins.", "Bir hücreye tıklayın ve tabloda hangi komşunun kazandığına bakın."),
      tx("Follow the arrows by eye: they already sketch the rivers.", "Okları gözünüzle takip edin: nehirleri şimdiden çiziyorlar."),
      ...(DISTANCE_EXAMPLE
        ? [
            <span key="ex">
              {tx("Distance matters: ", "Mesafe önemlidir: ")}
              <button
                type="button"
                onClick={() => setSelected(DISTANCE_EXAMPLE)}
                className="cursor-pointer inline text-left underline decoration-dotted underline-offset-2 text-[var(--acc)] font-semibold"
              >
                {tx("show a cell where the lowest neighbour does not win", "en alçak komşunun kazanmadığı bir hücreyi göster")}
              </button>
            </span>,
          ]
        : []),
    ];
    if (sel) {
      const n = neighbourSlopes(sel[0], sel[1]).filter((x) => x.elev !== null);
      const win = n.reduce((a, b) => (b.slope > a.slope ? b : a));
      const lowest = n.reduce((a, b) => (b.drop > a.drop ? b : a));
      const dir = D8_GRID[sel[0]][sel[1]];
      observe =
        dir === "SINK" || WATER_CELLS.has(key(sel[0], sel[1])) ? (
          <p>
            {tx(
              "This is water. Flat water has no downhill neighbour, so it is simply passed on to the outlet of its lake or bay.",
              "Bu bir su yüzeyi. Düz suyun yokuş aşağı komşusu yoktur; su doğrudan göl veya körfez çıkışına aktarılır."
            )}
          </p>
        ) : (
          <>
            <p>
              {tx(
                `From ${DEM[sel[0]][sel[1]]} m, the steepest way down is ${DIR_NAME[win.dir].en}: a drop of ${win.drop} m over ${fmt(win.distKm, 2)} km = ${fmt(win.slope)} m/km. All water from this cell goes that way.`,
                `${DEM[sel[0]][sel[1]]} m'den en dik iniş ${DIR_NAME[win.dir].tr} yönünde: ${fmt(win.distKm, 2)} km'de ${win.drop} m düşü = ${fmt(win.slope)} m/km. Bu hücredeki suyun tamamı o yöne gider.`
              )}
            </p>
            {lowest.dir !== win.dir && (
              <p>
                {tx(
                  `Notice: the ${DIR_NAME[lowest.dir].en} neighbour is lower (drop ${lowest.drop} m) but it is ${fmt(lowest.distKm, 2)} km away, so its slope is only ${fmt(lowest.slope)} m/km.`,
                  `Dikkat: ${DIR_NAME[lowest.dir].tr} komşu daha alçak (${lowest.drop} m düşü) ama ${fmt(lowest.distKm, 2)} km uzakta; bu yüzden eğimi yalnızca ${fmt(lowest.slope)} m/km.`
                )}
              </p>
            )}
          </>
        );
    } else observe = clickHint;
  }

  if (chapter === 2) {
    title = tx("Flow path: follow a raindrop", "Akış yolu: bir yağmur damlasını izleyin");
    idea = (
      <p>
        {tx(
          "Follow the arrows from cell to cell and you get the path a raindrop takes. Every path ends at the lake or the bay. The ridge where paths split towards different outlets is the drainage divide.",
          "Okları hücreden hücreye izlerseniz bir yağmur damlasının yolunu elde edersiniz. Her yol göle ya da körfeze varır. Yolların farklı çıkışlara ayrıldığı sırt, su ayrım çizgisidir."
        )}
      </p>
    );
    controls = <Toggle checked={showDivide} onChange={setShowDivide} label={tx("Show the drainage divide", "Su ayrım çizgisini göster")} />;
    tryThis = [
      tx("Click anywhere and watch the raindrop travel.", "Herhangi bir yere tıklayın ve damlanın yolculuğunu izleyin."),
      tx("Click two neighbouring cells on the top ridge — do they reach the same outlet?", "Üst sırtta yan yana iki hücreye tıklayın — aynı çıkışa mı varıyorlar?"),
      tx("Turn on the drainage divide and check your answer.", "Su ayrım çizgisini açın ve cevabınızı kontrol edin."),
    ];
    if (sel && path) {
      const steps = path.length - 1;
      observe = (
        <p>
          {tx(
            `The raindrop from ${selLabel} crosses ${steps} cells, falls from ${DEM[sel[0]][sel[1]]} m to 0 m and ends in ${outletName(sel, tx)}.`,
            `${selLabel} hücresinden çıkan damla ${steps} hücre geçer, ${DEM[sel[0]][sel[1]]} m'den 0 m'ye iner ve ${outletName(sel, tx)} ulaşır.`
          )}
        </p>
      );
    } else observe = clickHint;
  }

  if (chapter === 3) {
    title = tx("Flow accumulation: where rivers form", "Akış birikimi: nehirler nerede oluşur");
    idea = (
      <>
        <p>
          {tx(
            "For every cell, count how many cells send their water through it (the cell itself included). Ridge cells get 1. Valley cells collect water from many cells.",
            "Her hücre için, suyunu o hücreden geçiren hücre sayısını sayın (hücrenin kendisi dahil). Sırt hücreleri 1 alır; vadi hücreleri birçok hücreden su toplar."
          )}
        </p>
        <p>
          {tx(
            "Since each cell is 1 km², the count is also the upstream area in km². Where it is large, a river forms.",
            "Her hücre 1 km² olduğu için bu sayı aynı zamanda km² cinsinden memba alanıdır. Büyük olduğu yerde nehir oluşur."
          )}
        </p>
      </>
    );
    controls = (
      <>
        <Slider
          label={tx("River threshold", "Akarsu eşiği")}
          value={threshold}
          min={2}
          max={40}
          step={1}
          unit={tx("cells", "hücre")}
          hint={tx("A cell is drawn as a river when at least this many cells drain through it.", "Bir hücre, içinden en az bu kadar hücrenin suyu geçiyorsa nehir olarak çizilir.")}
          onChange={changeThreshold}
        />
        <ChangeNote change={change} />
      </>
    );
    tryThis = [
      tx("Lower the threshold: many small streams appear (a dense network).", "Eşiği düşürün: birçok küçük dere belirir (yoğun bir ağ)."),
      tx("Raise it: only the main rivers remain.", "Eşiği yükseltin: yalnızca ana nehirler kalır."),
      tx("Click a river cell — its number is its upstream area.", "Bir nehir hücresine tıklayın — üzerindeki sayı memba alanıdır."),
    ];
    observe = (
      <>
        <p>
          {tx(
            `With a threshold of ${threshold} cells, ${riverCount} of ${ROWS * COLS} cells (${fmt((riverCount / (ROWS * COLS)) * 100, 0)}%) are rivers.`,
            `${threshold} hücrelik eşikte ${ROWS * COLS} hücreden ${riverCount} tanesi (%${fmt((riverCount / (ROWS * COLS)) * 100, 0)}) nehir.`
          )}
        </p>
        {sel && (
          <p>
            {tx(
              `${ACC_GRID[sel[0]][sel[1]]} cells drain through ${selLabel} → upstream area ${ACC_GRID[sel[0]][sel[1]]} km².`,
              `${selLabel} hücresinden ${ACC_GRID[sel[0]][sel[1]]} hücrenin suyu geçer → memba alanı ${ACC_GRID[sel[0]][sel[1]]} km².`
            )}
          </p>
        )}
      </>
    );
  }

  if (chapter === 4) {
    title = tx("Watershed: all the land that drains to one point", "Havza: tek bir noktaya drene olan tüm alan");
    idea = (
      <p>
        {tx(
          "Pick a pour point (an outlet) on a river. Its watershed, or catchment, is every cell whose water passes through that point. Its edge is a drainage divide.",
          "Bir nehir üzerinde bir çıkış noktası (pour point) seçin. Bu noktanın havzası, suyu o noktadan geçen tüm hücrelerdir. Havzanın sınırı bir su ayrım çizgisidir."
        )}
      </p>
    );
    controls = <ChangeNote change={change} emptyHint={tx("Click a second pour point — this box will compare the two catchments.", "İkinci bir çıkış noktasına tıklayın — bu kutu iki havzayı karşılaştıracak.")} />;
    tryThis = [
      tx("Click a river cell near the top of a valley.", "Bir vadinin üst kısmındaki bir nehir hücresine tıklayın."),
      tx("Move the pour point downstream along the same river: the catchment grows.", "Çıkış noktasını aynı nehir boyunca mansaba doğru taşıyın: havza büyür."),
      tx("Click the lake outlet (bottom left) to see the whole western basin.", "Batı havzasının tamamını görmek için göl çıkışına (sol alt) tıklayın."),
    ];
    if (pourPoint && basin) {
      observe = (
        <p>
          {tx(
            `Pour point ${selLabel}: ${area} km² (${fmt((area / (ROWS * COLS)) * 100, 0)}% of the map) drains here. The longest flow path to it crosses ${longestPathTo(pourPoint, basin)} cells.`,
            `Çıkış noktası ${selLabel}: ${area} km² (haritanın %${fmt((area / (ROWS * COLS)) * 100, 0)}'i) buraya drene olur. Bu noktaya en uzun akış yolu ${longestPathTo(pourPoint, basin)} hücre geçer.`
          )}
        </p>
      );
    } else observe = <p>{tx("Click a cell to use it as the pour point.", "Çıkış noktası olarak kullanmak için bir hücreye tıklayın.")}</p>;
  }

  if (chapter === 5) {
    const ppLabel = pourPoint ? `(${pourPoint[0] + 1}, ${pourPoint[1] + 1})` : "";
    title = tx("Peak flow: how much water arrives?", "Pik debi: ne kadar su gelir?");
    idea = (
      <>
        <p>
          {tx(
            "During a heavy storm, how much water reaches the pour point at the worst moment? The Rational Method estimates this peak flow:",
            "Şiddetli bir yağışta en kötü anda çıkış noktasına ne kadar su ulaşır? Rasyonel Metot bu pik debiyi tahmin eder:"
          )}
        </p>
        <Formula>
          Q = C · I · A / 3.6
          <br />
          <span className="text-[var(--ink2)]">
            {tx(
              "C runoff share (0–1) · I rain intensity (mm/h) · A area (km²) · 3.6 converts units → Q in m³/s",
              "C akış katsayısı (0–1) · I yağış şiddeti (mm/sa) · A alan (km²) · 3.6 birim dönüşümü → Q, m³/s"
            )}
          </span>
        </Formula>
      </>
    );
    controls = (
      <>
        <Segmented
          label={tx("Land cover → runoff coefficient C", "Arazi örtüsü → akış katsayısı C")}
          options={LAND_COVER.map((l) => ({ value: l.id, label: `${tx(l.en, l.tr)} ${l.c}` }))}
          value={cover}
          onChange={changeCover}
        />
        <Slider
          label={tx("Rain intensity I", "Yağış şiddeti I")}
          value={intensity}
          min={10}
          max={100}
          step={5}
          unit="mm/h"
          onChange={changeIntensity}
        />
        <Formula>
          Q = {coverObj.c} × {intensity} × {area} / 3.6 = <strong>{fmt(peakQ)} m³/s</strong>
        </Formula>
        <CoverBars area={area} intensity={intensity} active={cover} />
        <ChangeNote change={change} />
      </>
    );
    tryThis = [
      tx("Switch Forest → City: same rain, same area. How much more water?", "Orman → Şehir yapın: aynı yağış, aynı alan. Ne kadar fazla su?"),
      tx("Double the rain intensity. What happens to Q?", "Yağış şiddetini iki katına çıkarın. Q'ya ne olur?"),
      tx("Click a smaller or bigger catchment on the map.", "Haritada daha küçük ya da daha büyük bir havzaya tıklayın."),
    ];
    observe = (
      <>
        <p>
          {tx(
            `${area} km² drains to ${ppLabel}${!selected ? " (the lake outlet — click the map to choose another point)" : ""}. With ${tx(coverObj.en, coverObj.tr).toLowerCase()} (C = ${coverObj.c}) and ${intensity} mm/h of rain, the peak flow is ${fmt(peakQ)} m³/s.`,
            `${ppLabel} noktasına ${area} km² drene olur${!selected ? " (göl çıkışı — başka bir nokta için haritaya tıklayın)" : ""}. ${tx(coverObj.en, coverObj.tr)} (C = ${coverObj.c}) ve ${intensity} mm/sa yağışla pik debi ${fmt(peakQ)} m³/s olur.`
          )}
        </p>
        <p>
          {tx(
            "Q is proportional to each factor: double C, I or A and the peak flow doubles. Paving land (raising C) floods rivers just like heavier rain does.",
            "Q her bir faktörle doğru orantılıdır: C, I veya A iki katına çıkarsa pik debi de iki katına çıkar. Araziyi betonlamak (C'yi artırmak), nehirleri daha şiddetli yağış kadar taşırır."
          )}
        </p>
        <p className="text-[12px] text-[var(--mut)]">
          {tx(
            "Caution: the Rational Method is meant for small catchments (a few km²) and assumes the rain lasts long enough for the whole area to contribute. It is used here because it shows cause and effect clearly.",
            "Not: Rasyonel Metot küçük havzalar (birkaç km²) içindir ve yağışın tüm alanın katkı verebileceği kadar sürdüğünü varsayar. Burada neden-sonuç ilişkisini açıkça gösterdiği için kullanılıyor."
          )}
        </p>
      </>
    );
  }

  const layer: MapLayer = chapter === 3 ? "acc" : "elev";
  const info = hover ?? selected;

  return (
    <div className="flex flex-col gap-5">
      <ChapterNav chapters={CHAPTERS} active={chapter} onSelect={goTo} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-5 items-start">
        <div className="lg:sticky lg:top-[136px] flex flex-col gap-2 p-3 sm:p-4 bg-[var(--atlas-card)] border border-[var(--line)]">
          <TerrainMap
            layer={layer}
            chapter={chapter}
            selected={chapter >= 4 ? pourPoint : selected}
            hover={hover}
            onHover={setHover}
            onSelect={select}
            showArrows={chapter === 1 && showArrows}
            showDivide={chapter === 2 && showDivide}
            path={path}
            threshold={chapter >= 3 ? threshold : null}
            basin={basin}
          />
          <div className="min-h-[36px] font-plex-mono text-[12px] text-[var(--ink2)]" aria-live="polite">
            {info ? (
              <span>
                <strong className="text-[var(--ink)]">
                  {tx("Row", "Satır")} {info[0] + 1}, {tx("col", "sütun")} {info[1] + 1}
                </strong>{" "}
                · {DEM[info[0]][info[1]]} m · {tx("flows", "akış")}{" "}
                {DIR_NAME[D8_GRID[info[0]][info[1]] as Direction][lang]} · {ACC_GRID[info[0]][info[1]]}{" "}
                {tx("cells drain here", "hücre buraya drene olur")}
              </span>
            ) : (
              <span className="text-[var(--mut)]">
                {tx("Hover or tap a cell to read it. Keyboard: focus the map, use arrow keys and Enter.", "Bir hücrenin bilgisini görmek için üzerine gelin veya dokunun. Klavye: haritaya odaklanın, ok tuşları ve Enter.")}
              </span>
            )}
          </div>
          <MapLegend layer={layer} chapter={chapter} />
        </div>

        <LessonPanel
          key={chapter}
          index={chapter}
          total={CHAPTERS.length}
          title={title}
          idea={idea}
          controls={controls}
          tryThis={tryThis}
          observe={observe}
          onPrev={chapter > 0 ? () => goTo(chapter - 1) : undefined}
          onNext={chapter < CHAPTERS.length - 1 ? () => goTo(chapter + 1) : undefined}
        />
      </div>

      <Manual
        title={tx("Short manual & glossary — Watershed lab", "Kısa kılavuz ve sözlük — Havza laboratuvarı")}
        steps={[
          tx("Work through the chapters in order; each one adds a single idea to the previous one.", "Bölümleri sırayla izleyin; her biri öncekine tek bir yeni fikir ekler."),
          tx("Read “The idea”, then do the “Try this” steps on the map.", "Önce “Temel fikir”i okuyun, sonra haritada “Bunu deneyin” adımlarını uygulayın."),
          tx("“What you see” explains the result of your last click or change in words.", "“Ne görüyorsunuz” kutusu son tıklamanızın veya değişikliğinizin sonucunu sözle açıklar."),
          tx("When you move a slider, the grey box reports cause → effect with the numbers before and after.", "Bir kaydırıcıyı oynattığınızda, gri kutu önceki ve sonraki sayılarla neden → sonuç ilişkisini gösterir."),
          tx("The terrain is synthetic and simplified (15 × 12 cells of 1 km). It is built for learning, not for design.", "Arazi sentetik ve basitleştirilmiştir (1 km'lik 15 × 12 hücre). Tasarım için değil, öğrenmek için yapılmıştır."),
        ]}
        glossary={[
          { term: "DEM", def: tx("Digital elevation model — a grid of ground heights.", "Sayısal yükseklik modeli — zemin yüksekliklerinden oluşan ızgara.") },
          { term: "D8", def: tx("Flow-direction rule: water goes to the steepest of the 8 neighbours.", "Akış yönü kuralı: su 8 komşudan en dik eğimliye gider.") },
          { term: tx("Flow accumulation", "Akış birikimi"), def: tx("Number of cells that drain through a cell (its upstream area).", "Bir hücreden suyu geçen hücre sayısı (memba alanı).") },
          { term: tx("Pour point", "Çıkış noktası"), def: tx("The point where a watershed's water leaves it.", "Havzanın suyunun havzayı terk ettiği nokta.") },
          { term: tx("Watershed / catchment", "Havza"), def: tx("All land that drains to one pour point.", "Tek bir çıkış noktasına drene olan tüm alan.") },
          { term: tx("Drainage divide", "Su ayrım çizgisi"), def: tx("The ridge line that separates two watersheds.", "İki havzayı ayıran sırt çizgisi.") },
          { term: tx("Runoff coefficient C", "Akış katsayısı C"), def: tx("Share of rain that becomes surface runoff (0 = none, 1 = all).", "Yağışın yüzey akışına dönüşen payı (0 = hiç, 1 = tamamı).") },
        ]}
      />
    </div>
  );
}

// ── Small pieces ──────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer font-display text-[13px] text-[var(--ink)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[var(--acc)]" />
      {label}
    </label>
  );
}

/** 3 × 3 view of a cell and its neighbours: heights, or drop & slope with the D8 winner marked. */
function NeighbourGrid({ cell, mode }: { cell: Cell; mode: "elev" | "slope" }) {
  const tx = useTx();
  const n = neighbourSlopes(cell[0], cell[1]);
  const valid = n.filter((x) => x.elev !== null);
  const winner = mode === "slope" ? valid.reduce((a, b) => (b.slope > a.slope ? b : a)) : null;
  const order = [n[0], n[1], n[2], n[3], null, n[4], n[5], n[6], n[7]];
  const centre = DEM[cell[0]][cell[1]];
  return (
    <div>
      <div className="font-display text-[12.5px] font-semibold text-[var(--ink)] mb-1.5">
        {mode === "elev"
          ? tx("The cell (centre) and its 8 neighbours", "Hücre (ortada) ve 8 komşusu")
          : tx("Drop and slope to each neighbour", "Her komşuya düşü ve eğim")}
      </div>
      <div className="grid grid-cols-3 gap-1 max-w-[300px]">
        {order.map((nb, i) => {
          if (!nb)
            return (
              <div key={i} className="p-1.5 text-center bg-[var(--frame)] text-[var(--paper)]">
                <div className="font-plex-mono text-[14px] font-bold">{centre}</div>
                <div className="font-plex-mono text-[9.5px] opacity-80">{tx("this cell", "bu hücre")}</div>
              </div>
            );
          if (nb.elev === null)
            return (
              <div key={i} className="p-1.5 text-center border border-dashed border-[var(--line)] font-plex-mono text-[10px] text-[var(--mut)]">
                {tx("edge", "kenar")}
              </div>
            );
          const lower = nb.drop > 0;
          const isWin = winner && nb.dir === winner.dir && winner.slope > 0;
          return (
            <div
              key={i}
              className={`p-1.5 text-center border ${isWin ? "border-2 border-[var(--viz-out)] bg-[var(--paper)]" : "border-[var(--line)]"} ${lower ? "" : "opacity-55"}`}
            >
              <div className="font-plex-mono text-[13px] font-bold text-[var(--ink)]">{nb.elev} m</div>
              {mode === "slope" ? (
                <div className="font-plex-mono text-[9.5px] text-[var(--ink2)] leading-tight">
                  {lower ? `↓${nb.drop} / ${fmt(nb.distKm, 2)}` : tx("uphill", "yokuş")}
                  <br />
                  {lower ? `${fmt(nb.slope)} m/km` : ""}
                  {isWin && <span className="block font-bold text-[var(--ink)]">{tx("steepest", "en dik")}</span>}
                </div>
              ) : (
                <div className="font-plex-mono text-[9.5px] text-[var(--ink2)]">{lower ? tx("lower", "daha alçak") : tx("higher", "daha yüksek")}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Peak flow for each land cover at the current rain and area — one series, active bar emphasised. */
function CoverBars({ area, intensity, active }: { area: number; intensity: number; active: CoverId }) {
  const tx = useTx();
  const max = (0.85 * 100 * Math.max(area, 1)) / 3.6;
  return (
    <div>
      <div className="font-display text-[12.5px] font-semibold text-[var(--ink)] mb-1.5">
        {tx(`Peak flow for each land cover (I = ${intensity} mm/h, A = ${area} km²)`, `Her arazi örtüsü için pik debi (I = ${intensity} mm/sa, A = ${area} km²)`)}
      </div>
      <div className="flex flex-col gap-1">
        {LAND_COVER.map((l) => {
          const q = (l.c * intensity * area) / 3.6;
          const isActive = l.id === active;
          return (
            <div key={l.id} className="grid grid-cols-[76px_1fr_64px] items-center gap-2">
              <span className={`font-display text-[12px] ${isActive ? "font-bold text-[var(--ink)]" : "text-[var(--ink2)]"}`}>{tx(l.en, l.tr)}</span>
              <span className="h-3.5 bg-[var(--paper)] border border-[var(--line)] relative">
                <span
                  className="absolute inset-y-0 left-0 rounded-r-[3px] transition-[width] duration-300"
                  style={{ width: `${(q / max) * 100}%`, background: "var(--viz-in)", opacity: isActive ? 1 : 0.35 }}
                />
              </span>
              <span className={`font-plex-mono text-[11.5px] text-right tabular-nums ${isActive ? "font-bold text-[var(--ink)]" : "text-[var(--ink2)]"}`}>
                {fmt(q, 0)} m³/s
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Map ───────────────────────────────────────────────────────────────

type MapLayer = "elev" | "acc";

function TerrainMap({
  layer,
  chapter,
  selected,
  hover,
  onHover,
  onSelect,
  showArrows,
  showDivide,
  path,
  threshold,
  basin,
}: {
  layer: MapLayer;
  chapter: number;
  selected: Cell | null;
  hover: Cell | null;
  onHover: (c: Cell | null) => void;
  onSelect: (c: Cell) => void;
  showArrows: boolean;
  showDivide: boolean;
  path: [number, number][] | null;
  threshold: number | null;
  basin: Set<string> | null;
}) {
  const tx = useTx();
  const { dark } = useAtlas();
  const reduceMotion = useReducedMotion();
  const [cursor, setCursor] = useState<Cell>([0, 0]);

  const showNumbers = chapter <= 1 || chapter === 3;
  const cx = (c: number) => c * CELL_W + CELL_W / 2;
  const cy = (r: number) => r * CELL_H + CELL_H / 2;

  const fillFor = (r: number, c: number) => {
    if (WATER_CELLS.has(key(r, c))) return { fill: "var(--map-water)", t: 0 };
    if (layer === "acc") {
      const t = Math.log(ACC_GRID[r][c]) / Math.log(MAX_ACC);
      return { fill: `color-mix(in oklab, var(--map-acc-hi) ${(t * 100).toFixed(0)}%, var(--map-acc-lo))`, t };
    }
    const t = DEM[r][c] / MAX_ELEV;
    // later chapters fade the terrain so overlays stand out
    const pct = chapter >= 2 ? t * 55 : t * 100;
    return { fill: `color-mix(in oklab, var(--map-elev-hi) ${pct.toFixed(0)}%, var(--map-elev-lo))`, t: pct / 100 };
  };

  const textFill = (t: number) => (t > 0.58 ? (dark ? "#0b1526" : "#ffffff") : "var(--ink)");

  const neighbourhood = selected && chapter <= 1 ? selected : null;

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const [r, c] = cursor;
    const moves: Record<string, Cell> = {
      ArrowUp: [Math.max(0, r - 1), c],
      ArrowDown: [Math.min(ROWS - 1, r + 1), c],
      ArrowLeft: [r, Math.max(0, c - 1)],
      ArrowRight: [r, Math.min(COLS - 1, c + 1)],
    };
    if (moves[e.key]) {
      setCursor(moves[e.key]);
      onHover(moves[e.key]);
      e.preventDefault();
    } else if (e.key === "Enter" || e.key === " ") {
      onSelect(cursor);
      e.preventDefault();
    }
  };

  const riverSegs =
    threshold !== null
      ? (() => {
          const segs: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
          for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++) {
              const a = ACC_GRID[r][c];
              const d = D8_GRID[r][c];
              if (a < threshold || d === "SINK" || WATER_CELLS.has(key(r, c))) continue;
              const [vx, vy] = DIR_VECTOR[d];
              segs.push({ x1: cx(c), y1: cy(r), x2: cx(c + vx), y2: cy(r + vy), w: 1.5 + 4 * (Math.log(a) / Math.log(MAX_ACC)) });
            }
          return segs;
        })()
      : [];

  const basinEdges = basin
    ? (() => {
        const segs: [number, number, number, number][] = [];
        basin.forEach((k) => {
          const [r, c] = k.split(",").map(Number);
          const x = c * CELL_W;
          const y = r * CELL_H;
          if (!basin.has(key(r - 1, c))) segs.push([x, y, x + CELL_W, y]);
          if (!basin.has(key(r + 1, c))) segs.push([x, y + CELL_H, x + CELL_W, y + CELL_H]);
          if (!basin.has(key(r, c - 1))) segs.push([x, y, x, y + CELL_H]);
          if (!basin.has(key(r, c + 1))) segs.push([x + CELL_W, y, x + CELL_W, y + CELL_H]);
        });
        return segs;
      })()
    : [];

  const pathD = path && path.length > 1 ? path.map(([r, c], i) => `${i ? "L" : "M"}${cx(c)},${cy(r)}`).join(" ") : null;

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="w-full h-auto block select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc)] rounded-sm"
      tabIndex={0}
      aria-label={tx("Terrain map, 15 by 12 cells. Use arrow keys to move and Enter to select.", "Arazi haritası, 15 × 12 hücre. Hareket için ok tuşlarını, seçmek için Enter'ı kullanın.")}
      onKeyDown={onKey}
      onPointerLeave={() => onHover(null)}
    >
      {DEM.map((row, r) =>
        row.map((elev, c) => {
          const { fill, t } = fillFor(r, c);
          const inBasin = basin?.has(key(r, c));
          return (
            <g
              key={key(r, c)}
              onPointerEnter={() => onHover([r, c])}
              onClick={() => {
                setCursor([r, c]);
                onSelect([r, c]);
              }}
              className="cursor-pointer"
            >
              <rect x={c * CELL_W} y={r * CELL_H} width={CELL_W} height={CELL_H} style={{ fill }} stroke="var(--atlas-card)" strokeWidth={1} />
              {inBasin && (
                <rect x={c * CELL_W} y={r * CELL_H} width={CELL_W} height={CELL_H} style={{ fill: "var(--map-basin)" }} opacity={0.38} pointerEvents="none" />
              )}
              {showNumbers && (
                <text
                  x={cx(c)}
                  y={cy(r) + (showArrows ? -6 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fill={textFill(t)}
                  className="font-plex-mono tabular-nums max-sm:hidden"
                  pointerEvents="none"
                >
                  {layer === "acc" ? ACC_GRID[r][c] : WATER_CELLS.has(key(r, c)) ? "≈" : elev}
                </text>
              )}
              {showArrows && D8_GRID[r][c] !== "SINK" && (
                <Arrow x={cx(c)} y={cy(r) + (showNumbers ? 7 : 0)} dir={D8_GRID[r][c]} color={t > 0.58 ? textFill(t) : "var(--ink2)"} />
              )}
            </g>
          );
        })
      )}

      {/* rivers */}
      {riverSegs.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="var(--map-stream)" strokeWidth={s.w} strokeLinecap="round" pointerEvents="none" />
      ))}

      {/* drainage divide */}
      {showDivide &&
        DIVIDE_SEGMENTS.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth={3.5} strokeLinecap="round" pointerEvents="none" />
        ))}

      {/* catchment boundary */}
      {basinEdges.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="square" pointerEvents="none" />
      ))}

      {/* raindrop path */}
      {pathD && (
        <g pointerEvents="none">
          <path d={pathD} fill="none" stroke="var(--map-path)" strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" />
          <circle r={6} fill="var(--map-path)" stroke="var(--atlas-card)" strokeWidth={2} cx={reduceMotion ? cx(path![path!.length - 1][1]) : 0} cy={reduceMotion ? cy(path![path!.length - 1][0]) : 0}>
            {!reduceMotion && <animateMotion key={pathD} dur={`${Math.max(1.5, path!.length * 0.25)}s`} repeatCount="indefinite" path={pathD} />}
          </circle>
        </g>
      )}

      {/* 3 × 3 neighbourhood */}
      {neighbourhood && (
        <rect
          x={(neighbourhood[1] - 1) * CELL_W}
          y={(neighbourhood[0] - 1) * CELL_H}
          width={CELL_W * 3}
          height={CELL_H * 3}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          pointerEvents="none"
        />
      )}

      {/* hover + selection */}
      {hover && (
        <rect x={hover[1] * CELL_W + 1} y={hover[0] * CELL_H + 1} width={CELL_W - 2} height={CELL_H - 2} fill="none" stroke="var(--ink)" strokeWidth={1.5} pointerEvents="none" />
      )}
      {selected && (
        <g pointerEvents="none">
          <rect x={selected[1] * CELL_W + 1.5} y={selected[0] * CELL_H + 1.5} width={CELL_W - 3} height={CELL_H - 3} fill="none" stroke="var(--ink)" strokeWidth={3} />
          {chapter >= 4 && <circle cx={cx(selected[1])} cy={cy(selected[0])} r={6} fill="var(--ink)" stroke="var(--atlas-card)" strokeWidth={2} />}
        </g>
      )}

      {/* outlet labels */}
      {[WEST_OUTLET, EAST_OUTLET].map((o, i) => (
        <text
          key={i}
          x={cx(o[1])}
          y={cy(o[0]) + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight={700}
          fill="var(--ink)"
          className="font-display"
          paintOrder="stroke"
          stroke="var(--map-water)"
          strokeWidth={3}
          pointerEvents="none"
        >
          {i === 0 ? tx("Lake", "Göl") : tx("Bay", "Körfez")}
        </text>
      ))}
    </svg>
  );
}

function Arrow({ x, y, dir, color }: { x: number; y: number; dir: Direction; color: string }) {
  const [vx, vy] = DIR_VECTOR[dir];
  const len = Math.hypot(vx, vy);
  const ux = vx / len;
  const uy = vy / len;
  const L = 9;
  const x1 = x - ux * L * 0.5;
  const y1 = y - uy * L * 0.5;
  const x2 = x + ux * L * 0.5;
  const y2 = y + uy * L * 0.5;
  const hx = -uy * 3;
  const hy = ux * 3;
  return (
    <g pointerEvents="none">
      <line x1={x1} y1={y1} x2={x2 - ux * 2} y2={y2 - uy * 2} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <polygon points={`${x2 + ux},${y2 + uy} ${x2 - ux * 4 + hx},${y2 - uy * 4 + hy} ${x2 - ux * 4 - hx},${y2 - uy * 4 - hy}`} fill={color} />
    </g>
  );
}

function MapLegend({ layer, chapter }: { layer: MapLayer; chapter: number }) {
  const tx = useTx();
  const ramp = (lo: string, hi: string) => ({ background: `linear-gradient(to right, var(${lo}), var(${hi}))` });
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-[var(--line)] font-display text-[12px] text-[var(--ink2)]">
      {layer === "elev" ? (
        <span className="flex items-center gap-2">
          <span>{tx("Elevation", "Yükseklik")} 0 m</span>
          <span className="w-24 h-2.5 border border-[var(--line)]" style={ramp("--map-elev-lo", "--map-elev-hi")} />
          <span>{MAX_ELEV} m</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span>{tx("Cells draining through", "İçinden geçen hücre")} 1</span>
          <span className="w-24 h-2.5 border border-[var(--line)]" style={ramp("--map-acc-lo", "--map-acc-hi")} />
          <span>{MAX_ACC}</span>
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 border border-[var(--line)]" style={{ background: "var(--map-water)" }} />
        {tx("Water (0 m)", "Su (0 m)")}
      </span>
      {chapter === 1 && <span>→ {tx("flow direction", "akış yönü")}</span>}
      {chapter === 2 && (
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-[3px] rounded-full" style={{ background: "var(--map-path)" }} />
          {tx("raindrop path", "damla yolu")}
        </span>
      )}
      {chapter >= 3 && (
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-[3px] rounded-full" style={{ background: "var(--map-stream)" }} />
          {tx("river (width = flow accumulation)", "nehir (kalınlık = akış birikimi)")}
        </span>
      )}
      {chapter >= 4 && (
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 border-2 border-[var(--ink)]" style={{ background: "color-mix(in oklab, var(--map-basin) 40%, transparent)" }} />
          {tx("catchment of the pour point", "çıkış noktasının havzası")}
        </span>
      )}
    </div>
  );
}
