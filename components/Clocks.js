// Smakklockor som Systembolagets: en urtavla som fylls medurs från tolv, i 12 steg.
// Ölets färg visas bredvid som ett glas, eftersom färgen säger något om rostningen.
import { styleColor } from "@/data/beer";
import { spectrumFor } from "@/data/beerSpectrum";
import { beerProfile } from "@/data/beerSchool";
import { swatch, COLORS } from "@/components/Wine";

const to12 = (v5) => Math.max(1, Math.min(12, Math.round(1 + ((v5 - 1) * 11) / 4)));

function Clock({ v, label, color }) {
  const a = (Math.max(0, Math.min(12, v)) / 12) * 2 * Math.PI;
  const x = 20 + 17 * Math.sin(a), y = 20 - 17 * Math.cos(a);
  const d = v >= 12 ? null : `M20,20 L20,3 A17,17 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(2)},${y.toFixed(2)} Z`;
  return (
    <span className="clock" title={`${label} ${v} av 12`}>
      <svg viewBox="0 0 40 40" role="img" aria-label={`${label}: ${v} av 12`}>
        <circle cx="20" cy="20" r="18" className="cf" />
        {v >= 12 ? <circle cx="20" cy="20" r="17" fill={color} /> : <path d={d} fill={color} />}
        <circle cx="20" cy="20" r="18" className="cr" />
      </svg>
      <small>{label}</small>
    </span>
  );
}

const ebcWord = (e) => (e <= 12 ? "Ljus" : e <= 30 ? "Bärnsten" : e <= 60 ? "Mörk" : "Svart");

export function beerClocks(s) {
  const p = beerProfile(s), sp = spectrumFor(s.key);
  return [
    { label: "Beska", v: sp ? Math.max(1, Math.round(1 + (sp.b * 11) / 100)) : to12(p.beska) },
    { label: "Fyllighet", v: to12(p.fyllighet) },
    { label: "Sötma", v: to12(p.sotma) },
  ];
}
export function wineClocks(g) {
  const out = [
    { label: "Fyllighet", v: to12(g.p.fyllighet || 3) },
    { label: "Sötma", v: to12(g.p.sotma || 1) },
    { label: "Fruktsyra", v: to12(g.p.syra || 3) },
  ];
  if (g.color === "rott") out.push({ label: "Strävhet", v: to12(g.p.tannin || 3) });
  return out;
}

// kind "beer" med s (ölstil) eller "wine" med g (druva).
export default function Clocks({ kind, s, g, small = false }) {
  const beer = kind === "beer";
  const list = beer ? beerClocks(s) : wineClocks(g);
  const col = beer ? "#9A5B1E" : "#7A1E2C";
  const ebc = beer ? ((s.ebc?.[0] || 10) + (s.ebc?.[1] || 10)) / 2 : 0;
  const abv = beer && s.abv ? `${String(s.abv[0]).replace(".", ",")}–${String(s.abv[1]).replace(".", ",")} %` : null;
  return (
    <div className={"clocks" + (small ? " small" : "")}>
      {list.map((c) => <Clock key={c.label} v={c.v} label={c.label} color={col} />)}
      {beer
        ? <span className="clock colorc"><i className="cglass" style={{ background: styleColor(s) }} /><small>{ebcWord(ebc)}</small></span>
        : <span className="clock colorc"><i className="cglass wine" style={{ background: swatch(g.color) }} /><small>{(COLORS.find(([k]) => k === g.color) || [, "Färg"])[1]}</small></span>}
      {abv && !small && <span className="clock abv"><b>{abv}</b><small>Alkohol</small></span>}
    </div>
  );
}
