/* StudioFloorplan — STUDIO brief v0 (fitur KEEP utama), sekarang sebagai halaman
   EKSKLUSIF (/studio), bukan section landing:
   "1. partisi/dinding yang bisa di-adjust client
    2. saat drag furnitur, detail ukuran yang bisa di-adjust dalam cm
    dummy; akun belum tersedia"

   Canvas SVG floorplan interaktif + panel kontrol (dipakai StudioPage.tsx):
   - ruangan default 600×420 cm (Ruang Tamu), grid 40 cm
   - furnitur DRAGGABLE (pointer events): Sofa 3-seater, Meja TV, Kabinet — label cm
   - partisi adjustable: drag handle brass ubah panjang; drag badan geser posisi;
     klik tanpa geser = hapus; tombol tambah vertikal/horizontal
   - stepper cm: lebar/kedalaman ruang ±20; furnitur terpilih ±10
   - disclaimer dummy jujur (brief v0) */
import { useMemo, useRef, useState } from "react";
import Reveal from "../Reveal";
import { useLocale } from "../../hooks/useLocale";
import type { FurnitureItem, Partition, StudioData } from "../../types";

const CM_PER_PX = 1; // 1 px SVG = 1 cm pada viewBox room
const GRID = 40;
const PAD = 30; // padding viewBox di sekeliling room (px = cm)

interface Pt { x: number; y: number }
interface RoomPt extends Pt { scale: number }

type DragState =
  | { kind: "furn"; id: string; start: Pt; orig: Pt }
  | { kind: "part"; id: string; mode: "resize" | "move"; startClient: Pt; orig: Pt }
  | null;

export default function StudioFloorplan({ studio }: { studio: StudioData }) {
  const { t } = useLocale();
  const room = studio.room;
  const [roomW, setRoomW] = useState(room.w);
  const [roomD, setRoomD] = useState(room.d);

  /* furnitur lokal (posisi/ukuran bisa berubah) */
  const [furniture, setFurniture] = useState<FurnitureItem[]>((studio?.furniture ?? []).map((f: FurnitureItem) => ({ ...f })));
  const [selected, setSelected] = useState<string | null>(null);

  /* partisi lokal */
  const [partitions, setPartitions] = useState<Partition[]>((studio?.partitions ?? []).map((p: Partition) => ({ ...p })));

  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<DragState>(null);
  const moved = useRef(false);

  /* client px → koordinat room cm + skala (svg preserveAspectRatio meet) */
  const toRoom = (clientX: number, clientY: number): RoomPt => {
    const svg = svgRef.current;
    const vbW = roomW + PAD * 2;
    const vbH = roomD + PAD * 2;
    if (!svg) return { x: 0, y: 0, scale: 1 };
    const r = svg.getBoundingClientRect();
    const scale = Math.min(r.width / vbW, r.height / vbH);
    const offX = (r.width - vbW * scale) / 2;
    const offY = (r.height - vbH * scale) / 2;
    return {
      x: (clientX - r.left - offX) / scale + PAD,
      y: (clientY - r.top - offY) / scale + PAD,
      scale,
    };
  };

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  /* ---------- pointer handlers ---------- */
  const onFurnDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const f = furniture.find((x) => x.id === id);
    if (!f) return;
    const cur = toRoom(e.clientX, e.clientY);
    drag.current = { kind: "furn", id, start: { x: cur.x, y: cur.y }, orig: { x: f.x, y: f.y } };
    moved.current = false;
    setSelected(id);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onPartDown = (e: React.PointerEvent, id: string, mode: "resize" | "move") => {
    e.stopPropagation();
    const p = partitions.find((x) => x.id === id);
    if (!p) return;
    drag.current = {
      kind: "part",
      id,
      mode,
      startClient: { x: e.clientX, y: e.clientY },
      orig: { x: p.x, y: p.to },
    };
    moved.current = false;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    moved.current = true;
    if (d.kind === "furn") {
      const cur = toRoom(e.clientX, e.clientY);
      const f = furniture.find((x) => x.id === d.id);
      if (!f) return;
      const nx = clamp(Math.round(d.orig.x + (cur.x - d.start.x)), 0, roomW - f.w);
      const ny = clamp(Math.round(d.orig.y + (cur.y - d.start.y)), 0, roomD - f.d);
      setFurniture((prev) => prev.map((x) => (x.id === d.id ? { ...x, x: nx, y: ny } : x)));
    } else {
      const p = partitions.find((x) => x.id === d.id);
      if (!p) return;
      const scale = toRoom(e.clientX, e.clientY).scale;
      if (d.mode === "resize") {
        if (p.orientation === "horizontal") {
          const dx = (e.clientX - d.startClient.x) / scale / CM_PER_PX;
          const newTo = clamp(Math.round(d.orig.y + dx), 0, roomW);
          setPartitions((prev) => prev.map((x) => (x.id === d.id ? { ...x, to: Math.max(x.from + GRID, newTo) } : x)));
        } else {
          const dy = (e.clientY - d.startClient.y) / scale / CM_PER_PX;
          const newTo = clamp(Math.round(d.orig.y + dy), 0, roomD);
          setPartitions((prev) => prev.map((x) => (x.id === d.id ? { ...x, to: Math.max(x.from + GRID, newTo) } : x)));
        }
      } else {
        /* move: geser posisi tegak lurus orientasi */
        if (p.orientation === "horizontal") {
          const dy = (e.clientY - d.startClient.y) / scale / CM_PER_PX;
          const ny = clamp(Math.round(d.orig.x + dy), 0, roomD);
          setPartitions((prev) => prev.map((x) => (x.id === d.id ? { ...x, x: ny } : x)));
        } else {
          const dx = (e.clientX - d.startClient.x) / scale / CM_PER_PX;
          const nx = clamp(Math.round(d.orig.x + dx), 0, roomW);
          setPartitions((prev) => prev.map((x) => (x.id === d.id ? { ...x, x: nx } : x)));
        }
      }
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    /* klik tanpa geser pada partisi → hapus (pola build lama) */
    if (d && d.kind === "part" && !moved.current) {
      setPartitions((prev) => prev.filter((x) => x.id !== d.id));
    }
    moved.current = false;
  };

  /* ---------- stepper ---------- */
  const stepRoom = (axis: "w" | "d", delta: number) => {
    if (axis === "w") setRoomW((v: number) => clamp(v + delta, 200, 1200));
    else setRoomD((v: number) => clamp(v + delta, 200, 1200));
  };
  const stepFurn = (delta: number) => {
    if (!selected) return;
    setFurniture((prev) =>
      prev.map((f) => (f.id === selected ? { ...f, w: clamp(f.w + delta, 40, roomW - f.x) } : f)),
    );
  };

  const addPartition = (orientation: "vertical" | "horizontal") => {
    const id = `p${Date.now()}`;
    const label = `${t.studio.newPartition} ${partitions.length + 1}`;
    if (orientation === "vertical") {
      const x = Math.round(roomW * 0.6);
      setPartitions((prev) => [...prev, { id, orientation, x, from: 0, to: Math.round(roomD * 0.5), label }]);
    } else {
      const y = Math.round(roomD * 0.5);
      setPartitions((prev) => [
        ...prev,
        { id, orientation, x: y, from: 0, to: Math.round(roomW * 0.5), label },
      ]);
    }
  };

  const selFurn = furniture.find((f) => f.id === selected);

  /* grid lines (memo per ukuran ruang) */
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let x = GRID; x < roomW; x += GRID) lines.push({ x1: x, y1: 0, x2: x, y2: roomD });
    for (let y = GRID; y < roomD; y += GRID) lines.push({ x1: 0, y1: y, x2: roomW, y2: y });
    return lines;
  }, [roomW, roomD]);

  const vw = roomW + PAD * 2;
  const vh = roomD + PAD * 2;

  return (
    <Reveal className="mt-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* ===== Canvas floorplan ===== */}
        <div className="border tr-line rounded-sm tr-sunken/50 p-3 sm:p-5 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`-${PAD} -${PAD} ${vw} ${vh}`}
            className="w-full h-auto touch-none select-none"
            role="application"
            aria-label={t.studio.floorplanAria}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <defs>
              <pattern id="stGrid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" className="tr-grid" strokeWidth="1" />
            </pattern>
          </defs>

            {/* room */}
            <rect x={0} y={0} width={roomW} height={roomD} fill="url(#stGrid)" stroke="none" />
            <rect x={0} y={0} width={roomW} height={roomD} fill="none" className="tr-stroke" strokeWidth="4" />
            {gridLines.map((l, i) => (
              <line key={i} {...l} className="tr-grid-soft" strokeWidth="1" />
            ))}

            {/* label dimensi ruangan */}
            <text x={roomW / 2} y={-14} textAnchor="middle" fontSize="13" className="tr-dim">
              {roomW} cm
            </text>
            <text x={-14} y={roomD / 2} textAnchor="middle" fontSize="13" className="tr-dim" transform={`rotate(-90 -14 ${roomD / 2})`}>
              {roomD} cm
            </text>

            {/* partisi */}
            {partitions.map((p) =>
              p.orientation === "horizontal" ? (
                <g key={p.id}>
                  <line
                    x1={p.from} y1={p.x} x2={p.to} y2={p.x}
                    className="tr-stroke-brass cursor-grab" strokeWidth="3"
                    onPointerDown={(e) => onPartDown(e, p.id, "move")}
                  />
                  <circle
                    cx={p.to} cy={p.x} r="8" className="tr-brass-bg cursor-ew-resize"
                    onPointerDown={(e) => onPartDown(e, p.id, "resize")}
                    aria-label={`${t.studio.handlePartition} ${p.label}`}
                  />
                  <text x={(p.from + p.to) / 2} y={p.x - 10} textAnchor="middle" fontSize="12" className="tr-brass">
                    {p.label} · {p.to - p.from} cm
                  </text>
                </g>
              ) : (
                <g key={p.id}>
                  <line
                    x1={p.x} y1={p.from} x2={p.x} y2={p.to}
                    className="tr-stroke-brass cursor-grab" strokeWidth="3"
                    onPointerDown={(e) => onPartDown(e, p.id, "move")}
                  />
                  <circle
                    cx={p.x} cy={p.to} r="8" className="tr-brass-bg cursor-ns-resize"
                    onPointerDown={(e) => onPartDown(e, p.id, "resize")}
                    aria-label={`${t.studio.handlePartition} ${p.label}`}
                  />
                  <text x={p.x + 10} y={(p.from + p.to) / 2} fontSize="12" className="tr-brass">
                    {p.label} · {p.to - p.from} cm
                  </text>
                </g>
              ),
            )}

            {/* furnitur */}
            {furniture.map((f) => (
              <g
                key={f.id}
                transform={`translate(${f.x} ${f.y})`}
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => onFurnDown(e, f.id)}
              >
                <rect
                  width={f.w} height={f.d}
                  className="tr-brass-bg" fillOpacity={selected === f.id ? "0.18" : "0.10"}
                  stroke={selected === f.id ? "var(--tr-fg)" : "var(--tr-brass)"}
                  strokeWidth={selected === f.id ? 2.5 : 1.5}
                />
                <text x="4" y="-6" fontSize="12" className="tr-fg">{f.label}</text>
                <text x={f.w / 2} y={f.d / 2 + 4} textAnchor="middle" fontSize="11" className="tr-dim">
                  {f.w} × {f.d} cm
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* ===== Panel kontrol ===== */}
        <aside className="space-y-8">
          {/* Ruangan */}
          <div className="border-t-2 tr-line-strong pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">{t.studio.room}</p>
            <div className="mt-4 space-y-4">
              <Stepper label={t.studio.width} value={roomW} unit="cm" onMinus={() => stepRoom("w", -20)} onPlus={() => stepRoom("w", 20)} reduce={t.studio.reduce} increase={t.studio.increase} />
              <Stepper label={t.studio.depth} value={roomD} unit="cm" onMinus={() => stepRoom("d", -20)} onPlus={() => stepRoom("d", 20)} reduce={t.studio.reduce} increase={t.studio.increase} />
            </div>
            <p className="mt-4 text-xs tr-faint leading-relaxed">
              {t.studio.gridNote}
            </p>
          </div>

          {/* Partisi */}
          <div className="border-t tr-line pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">{t.studio.partitions}</p>
            <p className="mt-3 text-xs tr-faint leading-relaxed">
              {t.studio.partitionHint}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => addPartition("vertical")}
                className="text-xs font-medium border tr-line rounded-full px-3 py-1.5 hover:border-current transition-colors tr-fg cursor-pointer"
              >
                ＋ {t.studio.addVertical}
              </button>
              <button
                type="button"
                onClick={() => addPartition("horizontal")}
                className="text-xs font-medium border tr-line rounded-full px-3 py-1.5 hover:border-current transition-colors tr-fg cursor-pointer"
              >
                ＋ {t.studio.addHorizontal}
              </button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {partitions.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm tr-muted">
                  <span>{p.label}</span>
                  <span className="tabular-nums tr-faint">
                    {p.orientation === "horizontal" ? t.studio.orientationH : t.studio.orientationV} · {p.to - p.from} cm
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Furnitur */}
          <div className="border-t tr-line pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] tr-faint">{t.studio.furniture}</p>
            <p className="mt-3 text-xs tr-faint leading-relaxed">
              {t.studio.furnitureHint}
            </p>
            <ul className="mt-3 space-y-1.5">
              {furniture.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(f.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-sm border transition-colors cursor-pointer ${
                      selected === f.id
                        ? "tr-line-strong tr-invert-bg tr-invert-fg"
                        : "tr-line hover:border-current tr-fg"
                    }`}
                  >
                    <span className="font-medium">{f.label}</span>
                    <span className="float-right tabular-nums opacity-70">{f.w} × {f.d} cm</span>
                  </button>
                </li>
              ))}
            </ul>

            {selected && selFurn && (
              <div className="mt-4">
                <p className="text-xs tr-faint mb-2">
                  {t.studio.selectedSize} <span className="font-medium tr-fg">{selFurn.label}</span>
                </p>
                <Stepper
                  label={t.studio.furnitureWidth}
                  value={selFurn.w}
                  unit="cm"
                  onMinus={() => stepFurn(-10)}
                  onPlus={() => stepFurn(10)}
                  reduce={t.studio.reduce}
                  increase={t.studio.increase}
                />
              </div>
            )}
          </div>

          <p className="text-xs tr-faint border tr-line rounded-sm p-3 leading-relaxed">
            {t.studio.disclaimer}
          </p>
        </aside>
      </div>
    </Reveal>
  );
}

function Stepper({ label, value, unit, onMinus, onPlus, reduce, increase }: {
  label: string; value: number; unit: string; onMinus: () => void; onPlus: () => void;
  reduce: string; increase: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm tr-muted">{label}</span>
      <div className="flex items-center border tr-line rounded-full">
        <button
          type="button" onClick={onMinus} aria-label={`${reduce} ${label}`}
          className="w-9 h-9 rounded-full hover:bg-black/5 transition-colors tr-fg cursor-pointer"
        >
          −
        </button>
        <output className="w-20 text-center text-sm font-medium tabular-nums tr-fg">
          {value} <span className="text-xs tr-faint">{unit}</span>
        </output>
        <button
          type="button" onClick={onPlus} aria-label={`${increase} ${label}`}
          className="w-9 h-9 rounded-full hover:bg-black/5 transition-colors tr-fg cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
