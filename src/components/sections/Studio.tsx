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
    if (orientation === "vertical") {
      const x = Math.round(roomW * 0.6);
      setPartitions((prev) => [...prev, { id, orientation, x, from: 0, to: Math.round(roomD * 0.5), label: `Partisi ${prev.length + 1}` }]);
    } else {
      const y = Math.round(roomD * 0.5);
      setPartitions((prev) => [
        ...prev,
        { id, orientation, x: y, from: 0, to: Math.round(roomW * 0.5), label: `Partisi ${prev.length + 1}` },
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
        <div className="border border-neutral-200 rounded-sm bg-neutral-50/50 p-3 sm:p-5 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`-${PAD} -${PAD} ${vw} ${vh}`}
            className="w-full h-auto touch-none select-none"
            role="application"
            aria-label="Floorplan interaktif — seret furnitur, sesuaikan partisi dan ukuran dalam sentimeter"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <defs>
              <pattern id="stGrid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#141010" strokeOpacity="0.08" strokeWidth="1" />
              </pattern>
            </defs>

            {/* room */}
            <rect x={0} y={0} width={roomW} height={roomD} fill="url(#stGrid)" stroke="none" />
            <rect x={0} y={0} width={roomW} height={roomD} fill="none" stroke="#141010" strokeWidth="4" />
            {gridLines.map((l, i) => (
              <line key={i} {...l} stroke="#141010" strokeOpacity="0.05" strokeWidth="1" />
            ))}

            {/* label dimensi ruangan */}
            <text x={roomW / 2} y={-14} textAnchor="middle" fontSize="13" fill="#6b6259">
              {roomW} cm
            </text>
            <text x={-14} y={roomD / 2} textAnchor="middle" fontSize="13" fill="#6b6259" transform={`rotate(-90 -14 ${roomD / 2})`}>
              {roomD} cm
            </text>

            {/* partisi */}
            {partitions.map((p) =>
              p.orientation === "horizontal" ? (
                <g key={p.id}>
                  <line
                    x1={p.from} y1={p.x} x2={p.to} y2={p.x}
                    stroke="#b07f3a" strokeWidth="3" className="cursor-grab"
                    onPointerDown={(e) => onPartDown(e, p.id, "move")}
                  />
                  <circle
                    cx={p.to} cy={p.x} r="8" fill="#b07f3a" className="cursor-ew-resize"
                    onPointerDown={(e) => onPartDown(e, p.id, "resize")}
                    aria-label={`Handle partisi ${p.label}`}
                  />
                  <text x={(p.from + p.to) / 2} y={p.x - 10} textAnchor="middle" fontSize="12" fill="#8f6524">
                    {p.label} · {p.to - p.from} cm
                  </text>
                </g>
              ) : (
                <g key={p.id}>
                  <line
                    x1={p.x} y1={p.from} x2={p.x} y2={p.to}
                    stroke="#b07f3a" strokeWidth="3" className="cursor-grab"
                    onPointerDown={(e) => onPartDown(e, p.id, "move")}
                  />
                  <circle
                    cx={p.x} cy={p.to} r="8" fill="#b07f3a" className="cursor-ns-resize"
                    onPointerDown={(e) => onPartDown(e, p.id, "resize")}
                    aria-label={`Handle partisi ${p.label}`}
                  />
                  <text x={p.x + 10} y={(p.from + p.to) / 2} fontSize="12" fill="#8f6524">
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
                  fill="rgba(176,127,58,0.10)"
                  stroke={selected === f.id ? "#141010" : "#b07f3a"}
                  strokeWidth={selected === f.id ? 2.5 : 1.5}
                />
                <text x="4" y="-6" fontSize="12" fill="#141010">{f.label}</text>
                <text x={f.w / 2} y={f.d / 2 + 4} textAnchor="middle" fontSize="11" fill="#6b6259">
                  {f.w} × {f.d} cm
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* ===== Panel kontrol ===== */}
        <aside className="space-y-8">
          {/* Ruangan */}
          <div className="border-t-2 border-neutral-900 pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Ruangan</p>
            <div className="mt-4 space-y-4">
              <Stepper label="Lebar" value={roomW} unit="cm" onMinus={() => stepRoom("w", -20)} onPlus={() => stepRoom("w", 20)} />
              <Stepper label="Kedalaman" value={roomD} unit="cm" onMinus={() => stepRoom("d", -20)} onPlus={() => stepRoom("d", 20)} />
            </div>
            <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
              Grid = {GRID} cm. Semua dimensi dalam sentimeter. Nilai dummy per brief.
            </p>
          </div>

          {/* Partisi */}
          <div className="border-t border-neutral-200 pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Partisi / Dinding</p>
            <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
              Tarik handle brass untuk mengubah panjang. Seret badan partisi untuk menggeser posisi.
              Klik partisi tanpa menggeser untuk menghapus.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => addPartition("vertical")}
                className="text-xs font-medium border border-neutral-300 rounded-full px-3 py-1.5 hover:border-neutral-900 transition-colors cursor-pointer"
              >
                ＋ Partisi vertikal
              </button>
              <button
                type="button"
                onClick={() => addPartition("horizontal")}
                className="text-xs font-medium border border-neutral-300 rounded-full px-3 py-1.5 hover:border-neutral-900 transition-colors cursor-pointer"
              >
                ＋ Partisi horizontal
              </button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {partitions.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm text-neutral-700">
                  <span>{p.label}</span>
                  <span className="tabular-nums text-neutral-500">
                    {p.orientation === "horizontal" ? "horizontal" : "vertikal"} · {p.to - p.from} cm
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Furnitur */}
          <div className="border-t border-neutral-200 pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Furnitur</p>
            <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
              Seret furnitur di canvas. Pilih untuk melihat & mengubah ukuran (cm).
            </p>
            <ul className="mt-3 space-y-1.5">
              {furniture.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(f.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-sm border transition-colors cursor-pointer ${
                      selected === f.id
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 hover:border-neutral-900"
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
                <p className="text-xs text-neutral-500 mb-2">
                  Ukuran terpilih: <span className="font-medium text-neutral-900">{selFurn.label}</span>
                </p>
                <Stepper
                  label="Lebar furnitur"
                  value={selFurn.w}
                  unit="cm"
                  onMinus={() => stepFurn(-10)}
                  onPlus={() => stepFurn(10)}
                />
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-400 border border-neutral-200 rounded-sm p-3 leading-relaxed">
            Eksplorasi ruang interaktif — dummy. Akun dan fitur kolaborasi belum tersedia
            (sesuai brief v0).
          </p>
        </aside>
      </div>
    </Reveal>
  );
}

function Stepper({ label, value, unit, onMinus, onPlus }: {
  label: string; value: number; unit: string; onMinus: () => void; onPlus: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-neutral-600">{label}</span>
      <div className="flex items-center border border-neutral-300 rounded-full">
        <button
          type="button" onClick={onMinus} aria-label={`Kurangi ${label}`}
          className="w-9 h-9 rounded-full hover:bg-neutral-100 transition-colors text-neutral-900 cursor-pointer"
        >
          −
        </button>
        <output className="w-20 text-center text-sm font-medium tabular-nums">
          {value} <span className="text-xs text-neutral-400">{unit}</span>
        </output>
        <button
          type="button" onClick={onPlus} aria-label={`Tambah ${label}`}
          className="w-9 h-9 rounded-full hover:bg-neutral-100 transition-colors text-neutral-900 cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
