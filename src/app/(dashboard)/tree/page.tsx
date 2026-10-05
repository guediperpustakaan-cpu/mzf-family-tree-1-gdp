"use client";

import useSWR from "swr";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Network,
  Loader2,
  Heart,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LayoutGrid,
  GitBranch,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateAge, fullName, initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TreePerson {
  id: string;
  firstName: string;
  lastName?: string | null;
  gender: string;
  status: string;
  birthDate: string | null;
  deathDate: string | null;
  occupation?: string | null;
  photoUrl?: string | null;
}

interface Relationship {
  id: string;
  type: string;
  fromId: string;
  toId: string;
  from: TreePerson;
  to: TreePerson;
}

const NODE_W = 200;
const NODE_H = 96;
const COL_W = 236;
const LEVEL_H = 168;
const PAD = 60;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface Unit {
  id: string;
  members: string[];
  memberCols: number[];
  gen: number;
  col: number;
  width: number;
  placed: boolean;
}

interface Placed {
  person: TreePerson;
  col: number;
  gen: number;
  x: number;
  y: number;
  cx: number;
  cy: number;
  unitId: string;
}

interface SiblingGroup {
  parents: string[];
  parentX: number;
  parentY: number;
  barY: number;
  childXs: number[];
  childY: number;
}

function buildTree(people: TreePerson[], rels: Relationship[]) {
  const byId = new Map(people.map((p) => [p.id, p]));

  // Union-find to group spouses into a single layout unit
  const uf = new Map<string, string>();
  for (const p of people) uf.set(p.id, p.id);
  const find = (a: string): string => {
    let root = a;
    while (uf.get(root) !== root) root = uf.get(root)!;
    let cur = a;
    while (uf.get(cur) !== root) {
      const next = uf.get(cur)!;
      uf.set(cur, root);
      cur = next;
    }
    return root;
  };
  for (const r of rels) {
    if (r.type !== "SPOUSE") continue;
    if (!uf.has(r.fromId) || !uf.has(r.toId)) continue;
    const a = find(r.fromId);
    const b = find(r.toId);
    if (a !== b) uf.set(a, b);
  }

  const units = new Map<string, Unit>();
  for (const p of people) {
    const root = find(p.id);
    if (!units.has(root)) units.set(root, { id: root, members: [], memberCols: [], gen: 0, col: 0, width: 1, placed: false });
  }
  // Order members: older first, and keep the union-found male first for a stable draw order
  const birthOf = (id: string) => (byId.get(id)?.birthDate ? new Date(byId.get(id)!.birthDate!).getTime() : Infinity);
  for (const p of people) {
    const u = units.get(find(p.id))!;
    u.members.push(p.id);
  }
  for (const u of units.values()) {
    u.members.sort((a, b) => {
      const ga = byId.get(a)?.gender === "MALE" ? 0 : 1;
      const gb = byId.get(b)?.gender === "MALE" ? 0 : 1;
      if (ga !== gb) return ga - gb;
      return birthOf(a) - birthOf(b);
    });
  }

  // Adjacency: parent unit -> child unit
  const childrenOf = new Map<string, Set<string>>();
  const parentsOf = new Map<string, string[]>();
  for (const r of rels) {
    if (r.type !== "PARENT_CHILD") continue;
    if (!byId.has(r.fromId) || !byId.has(r.toId)) continue;
    const pu = find(r.fromId);
    const cu = find(r.toId);
    if (pu === cu) continue;
    if (!childrenOf.has(pu)) childrenOf.set(pu, new Set());
    childrenOf.get(pu)!.add(cu);
    const list = parentsOf.get(r.toId) ?? [];
    if (!list.includes(r.fromId)) list.push(r.fromId);
    parentsOf.set(r.toId, list);
  }

  const childUnitsOf = (unitId: string) => Array.from(childrenOf.get(unitId) ?? []);

  // Roots = units where no member has a recorded parent
  const rootUnits = Array.from(units.values()).filter((u) => !u.members.some((m) => parentsOf.has(m)));
  rootUnits.sort((a, b) => birthOf(a.members[0]) - birthOf(b.members[0]));

  // Generation: BFS from roots
  const genOf = new Map<string, number>();
  const queue: string[] = [];
  for (const r of rootUnits) {
    genOf.set(r.id, 0);
    queue.push(r.id);
  }
  while (queue.length) {
    const id = queue.shift()!;
    const g = genOf.get(id) ?? 0;
    for (const cu of childUnitsOf(id)) {
      const existing = genOf.get(cu);
      if (existing === undefined || existing < g + 1) {
        genOf.set(cu, g + 1);
        queue.push(cu);
      }
    }
  }
  for (const u of units.values()) u.gen = genOf.get(u.id) ?? 0;

  // DFS layout: assign a contiguous column block to each subtree
  const layout = (unitId: string, startCol: number): number => {
    const u = units.get(unitId);
    if (!u) return 0;
    if (u.placed) return u.width;

    const kids = childUnitsOf(unitId)
      .filter((k) => units.has(k))
      .sort((a, b) => birthOf(units.get(a)!.members[0]) - birthOf(units.get(b)!.members[0]));

    let cursor = startCol;
    for (const kid of kids) {
      const w = layout(kid, cursor);
      cursor += w;
    }
    const childrenWidth = cursor - startCol;
    u.width = Math.max(u.members.length, childrenWidth, 1);

    // Centre the members over their children's block so couples sit above their kids
    const membersStart = startCol + (u.width - u.members.length) / 2;
    u.memberCols = u.members.map((_, i) => membersStart + i);
    u.col = membersStart;
    u.placed = true;
    return u.width;
  };

  let col = 0;
  for (const r of rootUnits) {
    const w = layout(r.id, col);
    col += w + 1;
  }

  // Person positions
  const placed: Placed[] = [];
  for (const u of units.values()) {
    u.members.forEach((m, i) => {
      const person = byId.get(m);
      if (!person) return;
      const memberCol = u.memberCols[i] ?? u.col + i;
      const x = memberCol * COL_W + COL_W / 2;
      const y = u.gen * LEVEL_H + PAD;
      placed.push({
        person,
        col: memberCol,
        gen: u.gen,
        x,
        y,
        cx: x,
        cy: y + NODE_H / 2,
        unitId: u.id,
      });
    });
  }
  placed.sort((a, b) => a.gen - b.gen || a.x - b.x);

  const posById = new Map(placed.map((p) => [p.person.id, p]));

  // Group siblings that share the same parent set so they share one horizontal bar
  const groups = new Map<string, SiblingGroup>();
  for (const [childId, parentIds] of parentsOf) {
    const child = posById.get(childId);
    if (!child) continue;
    const ps = parentIds.map((p) => posById.get(p)).filter(Boolean) as Placed[];
    if (ps.length === 0) continue;
    const key = parentIds.slice().sort().join("|");
    const parentX = ps.reduce((s, p) => s + p.cx, 0) / ps.length;
    const parentY = Math.max(...ps.map((p) => p.y + NODE_H));
    const childY = child.y;
    const barY = childY - 34;
    const g = groups.get(key);
    if (g) {
      g.childXs.push(child.cx);
      g.barY = Math.min(g.barY, barY);
      g.childY = Math.min(g.childY, childY);
    } else {
      groups.set(key, { parents: parentIds, parentX, parentY, barY, childXs: [child.cx], childY });
    }
  }

  const maxCol = placed.reduce((m, p) => Math.max(m, p.col), 0);
  const maxGen = placed.reduce((m, p) => Math.max(m, p.gen), 0);

  return {
    placed,
    groups: Array.from(groups.values()),
    spouseLinks: rels
      .filter((r) => r.type === "SPOUSE" && posById.has(r.fromId) && posById.has(r.toId))
      .map((r) => {
        const a = posById.get(r.fromId)!;
        const b = posById.get(r.toId)!;
        // Always draw left-to-right so the heart sits on the link midpoint
        return a.cx <= b.cx ? { id: r.id, a, b } : { id: r.id, a: b, b: a };
      }),
    width: (maxCol + 1) * COL_W + PAD,
    height: (maxGen + 1) * LEVEL_H + NODE_H + PAD,
  };
}

export default function TreePage() {
  const { data: people, isLoading: pLoading } = useSWR<TreePerson[]>("/api/people", fetcher, {
    revalidateOnFocus: false,
  });
  const { data: rels, isLoading: rLoading } = useSWR<Relationship[]>("/api/relationships", fetcher, {
    revalidateOnFocus: false,
  });

  const [view, setView] = useState<"graph" | "list">("graph");
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const tree = useMemo(() => buildTree(people ?? [], rels ?? []), [people, rels]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    setZoom((prev) => {
      const next = clamp(prev * (1 - e.deltaY * 0.0015), 0.35, 2);
      const wx = (sx - pan.x) / prev;
      const wy = (sy - pan.y) / prev;
      setPan({ x: sx - wx * next, y: sy - wy * next });
      return next;
    });
  }, [pan.x, pan.y]);

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.px + (e.clientX - dragRef.current.sx),
      y: dragRef.current.py + (e.clientY - dragRef.current.sy),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const fit = useCallback(() => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !tree.width || !tree.height) return;
    const scale = clamp(Math.min(rect.width / tree.width, rect.height / tree.height) * 0.92, 0.35, 1.2);
    setZoom(scale);
    setPan({
      x: Math.max((rect.width - tree.width * scale) / 2, 20),
      y: Math.max((rect.height - tree.height * scale) / 2, 20),
    });
  }, [tree.width, tree.height]);

  // Auto-fit once the diagram has been measured
  useEffect(() => {
    if (!wrapRef.current || pLoading || rLoading) return;
    const rect = wrapRef.current.getBoundingClientRect();
    if (!rect.width) return;
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pLoading, rLoading, tree.width, tree.height]);

  if (pLoading || rLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Membina salasilah keluarga...</p>
      </div>
    );
  }

  if (!people || people.length === 0) {
    return (
      <Card className="p-16">
        <EmptyState
          icon={Network}
          title="Salasilah masih kosong"
          description="Tambah ahli keluarga dan hubungan untuk melihat grafik salasilah."
          action={
            <Link
              href="/people"
              className="inline-flex px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
            >
              Tambah Ahli
            </Link>
          }
        />
      </Card>
    );
  }

  const generationCount = tree.placed.reduce((m, p) => Math.max(m, p.gen), 0) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Grafik Salasilah</h2>
          <p className="mt-1 text-sm text-slate-500">
            {generationCount} generasi · {people.length} ahli keluarga
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setView("graph")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition",
                view === "graph" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <GitBranch className="w-4 h-4" />
              Grafik
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition",
                view === "list" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Senarai
            </button>
          </div>

          {view === "graph" && (
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setZoom((z) => clamp(z + 0.15, 0.35, 2))}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => clamp(z - 0.15, 0.35, 2))}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={fit}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition"
                title="Muat skrin"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {view === "graph" ? (
        <Card className="overflow-hidden">
          <div
            ref={wrapRef}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative h-[70vh] min-h-[480px] w-full overflow-hidden cursor-grab active:cursor-grabbing bg-slate-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(100,116,139,0.18) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                width: tree.width,
                height: tree.height,
                position: "relative",
              }}
            >
              <svg
                className="absolute inset-0 pointer-events-none"
                width={tree.width}
                height={tree.height}
                aria-hidden
              >
                {tree.groups.map((g, i) => {
                  const minX = Math.min(...g.childXs);
                  const maxX = Math.max(...g.childXs);
                  return (
                    <g key={i}>
                      <path
                        d={`M ${g.parentX} ${g.parentY} L ${g.parentX} ${g.barY} L ${minX} ${g.barY}`}
                        fill="none"
                        stroke="#a7f3d0"
                        strokeWidth={2}
                      />
                      <path
                        d={`M ${g.parentX} ${g.parentY} L ${g.parentX} ${g.barY} L ${maxX} ${g.barY}`}
                        fill="none"
                        stroke="#a7f3d0"
                        strokeWidth={2}
                      />
                      {g.childXs.map((cx, j) => (
                        <path
                          key={j}
                          d={`M ${cx} ${g.barY} L ${cx} ${g.childY}`}
                          fill="none"
                          stroke="#a7f3d0"
                          strokeWidth={2}
                        />
                      ))}
                      <circle cx={g.parentX} cy={g.parentY + 4} r={4} fill="#34d399" />
                    </g>
                  );
                })}

                {tree.spouseLinks.map((l) => (
                  <line
                    key={l.id}
                    x1={l.a.cx + NODE_W / 2}
                    y1={l.a.cy}
                    x2={l.b.cx - NODE_W / 2}
                    y2={l.b.cy}
                    stroke="#fda4af"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                ))}
              </svg>

              {tree.spouseLinks.map((l) => (
                <div
                  key={`h-${l.id}`}
                  className="absolute pointer-events-none z-10"
                  style={{
                    left: (l.a.cx + NODE_W / 2 + (l.b.cx - NODE_W / 2)) / 2 - 11,
                    top: l.a.cy - 11,
                  }}
                >
                  <div className="w-[22px] h-[22px] rounded-full bg-rose-50 ring-1 ring-rose-200 flex items-center justify-center">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-400" />
                  </div>
                </div>
              ))}

              {tree.placed.map((p) => (
                <div
                  key={p.person.id}
                  className="absolute"
                  style={{ left: p.cx - NODE_W / 2, top: p.y, width: NODE_W }}
                >
                  <TreeCard person={p.person} />
                </div>
              ))}
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-400 to-indigo-500" /> Lelaki
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-rose-400 to-pink-500" /> Perempuan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-300" /> Meninggal
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline">Skrol untuk zum · seret untuk alih</span>
            </div>
          </div>
        </Card>
      ) : (
        <GenerationList placed={tree.placed} />
      )}
    </div>
  );
}

function TreeCard({ person }: { person: TreePerson }) {
  const name = fullName(person);
  const age = calculateAge(person.birthDate, person.deathDate);
  const isDeceased = person.status === "DECEASED";

  return (
    <Link
      href={`/people/${person.id}`}
      className={cn(
        "block rounded-2xl border bg-white p-3 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5",
        isDeceased ? "border-slate-200 opacity-80" : "border-slate-200/80"
      )}
      style={{ height: NODE_H }}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden",
            isDeceased
              ? "bg-slate-400"
              : person.gender === "MALE"
              ? "bg-gradient-to-br from-blue-400 to-indigo-500"
              : "bg-gradient-to-br from-rose-400 to-pink-500"
          )}
        >
          {person.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials(name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{name}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 truncate">{person.occupation ?? "—"}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span
          className={cn(
            "text-[11px] font-medium px-2 py-0.5 rounded-md",
            isDeceased
              ? "text-slate-600 bg-slate-100"
              : person.gender === "MALE"
              ? "text-blue-700 bg-blue-50"
              : "text-rose-700 bg-rose-50"
          )}
        >
          {person.gender === "MALE" ? "L" : "P"}
        </span>
        <span className="text-[11px] text-slate-400">
          {isDeceased ? "Meninggal" : age !== null ? `${age} tahun` : "Hidup"}
        </span>
      </div>
    </Link>
  );
}

function GenerationList({ placed }: { placed: Placed[] }) {
  const gens = new Map<number, Placed[]>();
  for (const p of placed) {
    const list = gens.get(p.gen) ?? [];
    list.push(p);
    gens.set(p.gen, list);
  }
  const sorted = Array.from(gens.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="space-y-6">
      {sorted.map(([gen, list]) => (
        <div key={gen}>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Generasi {gen + 1}
              <span className="text-xs font-normal text-emerald-600/70">{list.length} ahli</span>
            </span>
            {gen > 0 && <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent" />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((p) => (
              <Card key={p.person.id} className="p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                <Link href={`/people/${p.person.id}`} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden",
                      p.person.status === "DECEASED"
                        ? "bg-slate-400"
                        : p.person.gender === "MALE"
                        ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                        : "bg-gradient-to-br from-rose-400 to-pink-500"
                    )}
                  >
                    {p.person.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.person.photoUrl} alt={fullName(p.person)} className="w-full h-full object-cover" />
                    ) : (
                      initials(fullName(p.person))
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{fullName(p.person)}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {calculateAge(p.person.birthDate, p.person.deathDate) !== null
                        ? `${calculateAge(p.person.birthDate, p.person.deathDate)} tahun`
                        : "—"}
                    </p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
