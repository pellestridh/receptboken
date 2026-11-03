"use client";
import Link from "next/link";

// Smakkartan som ett rutnät 3 x 3: samma axlar som punktkartan,
// men varje stil får en egen rad så att inget hamnar ovanpå något annat.
const band = (v, c = [1 / 3, 2 / 3]) => (v < c[0] ? 0 : v < c[1] ? 1 : 2);
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);

function cellName(axes, r, c) {
  if (axes.rows && axes.cols) return `${axes.rows[r]}, ${axes.cols[c]}`;
  const row = [axes.top, null, axes.bottom][r];
  const col = [axes.left, null, axes.right][c];
  if (row && col) return `${row} och ${lc(col)}`;
  return row || col || "Mitt emellan";
}

// items: [{ key, name, x, y, color, square, used, href, dim }]
export default function TasteGrid({ items, axes }) {
  const cells = Array.from({ length: 9 }, () => []);
  for (const it of items) cells[band(it.y, axes.cuts?.y) * 3 + band(it.x, axes.cuts?.x)].push(it);

  return (
    <div className="tgrid-wrap">
      <span className="ax top">{axes.top}</span><span className="ax bottom">{axes.bottom}</span>
      <span className="ax left">{axes.left}</span><span className="ax right">{axes.right}</span>
      <div className="tgrid">
        {cells.map((list, i) => {
          const r = Math.floor(i / 3), c = i % 3;
          return (
            <div key={i} className={`tcell r${r} c${c}`}>
              <div className="tcell-h">{cellName(axes, r, c)}</div>
              {list.length === 0 && <div className="tcell-e">–</div>}
              <ul>
                {list.map((it) => (
                  <li key={it.key} className={(it.used ? "used" : "") + (it.dim ? " dim" : "")}>
                    <Link href={it.href}>
                      <i className={"tdot" + (it.square ? " sq" : "")} style={{ background: it.color }} />
                      <span>{it.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Flyttar isär punkter som ligger för nära varandra, så att prickarna inte täcker varandra.
export function spread(pts, min = 34, W = 1000, H = 1000, P = 50) {
  const q = pts.map((p) => ({ ...p }));
  for (let it = 0; it < 80; it++) {
    let moved = false;
    for (let i = 0; i < q.length; i++) for (let j = i + 1; j < q.length; j++) {
      const a = q[i], b = q[j];
      let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      if (d >= min) continue;
      if (d < 0.01) { dx = (j % 2 ? 1 : -1); dy = (i % 2 ? 1 : -1); d = Math.SQRT2; }
      const push = (min - d) / 2;
      a.x -= (dx / d) * push; a.y -= (dy / d) * push;
      b.x += (dx / d) * push; b.y += (dy / d) * push;
      moved = true;
    }
    for (const p of q) { p.x = Math.max(P, Math.min(W - P, p.x)); p.y = Math.max(P, Math.min(H - P, p.y)); }
    if (!moved) break;
  }
  return q;
}

// Placerar namnen så att de inte krockar: provar höger, vänster, ovanför och under punkten.
export function placeLabels(list, W = 1000, cw = 19, h = 36, strict = false, dots = []) {
  const boxes = dots.map(({ x, y, r }) => ({ x1: x - r - 2, x2: x + r + 2, y1: y - r - 2, y2: y + r + 2 })), out = {};
  const hit = (a) => boxes.some((b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1);
  for (const { key, x, y, r, name } of list) {
    const w = name.length * cw, g = r + 10;
    const opts = [
      { x: x + g, y: y + 9, a: "start", b: { x1: x + g, x2: x + g + w, y1: y - h / 2, y2: y + h / 2 } },
      { x: x - g, y: y + 9, a: "end", b: { x1: x - g - w, x2: x - g, y1: y - h / 2, y2: y + h / 2 } },
      { x, y: y - g - 4, a: "middle", b: { x1: x - w / 2, x2: x + w / 2, y1: y - g - h, y2: y - g } },
      { x, y: y + g + 26, a: "middle", b: { x1: x - w / 2, x2: x + w / 2, y1: y + g, y2: y + g + h } },
    ].filter((o) => o.b.x1 > -20 && o.b.x2 < W + 20);
    const free = opts.find((o) => !hit(o.b));
    if (!free && strict) { boxes.push({ x1: x - r, x2: x + r, y1: y - r, y2: y + r }); continue; }
    const pick = free || opts[0] || { x: x + g, y: y + 9, a: "start", b: { x1: 0, x2: 0, y1: 0, y2: 0 } };
    boxes.push(pick.b, { x1: x - r, x2: x + r, y1: y - r, y2: y + r });
    out[key] = pick;
  }
  return out;
}
