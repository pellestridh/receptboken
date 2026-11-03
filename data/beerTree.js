// Översikten: samma kärnstilar som i kartan och korten, ordnade efter jäsning och familj.
// n = namn, k = stilkort i appen, ex = öl att leta efter, c = undergrupper.
import { STYLES, FAMILIES } from "@/data/beer";

const ROOTS = [
  { n: "Underjäst, lager", tone: "under", fams: ["lager"] },
  { n: "Överjäst, ale", tone: "over", fams: ["paleale", "ipa", "veteol", "belgisk", "starka"] },
  { n: "Syrlig öl och suröl", tone: "spontan", fams: ["syrlig"] },
];

export const TREE = ROOTS.map((r) => ({
  n: r.n, tone: r.tone,
  c: r.fams.map((f) => ({
    n: FAMILIES.find((x) => x.key === f).name, k: null, ex: [],
    c: STYLES.filter((s) => s.family === f).map((s) => ({ n: s.name, k: s.key, ex: s.examples || [], c: [] })),
  })),
}));
