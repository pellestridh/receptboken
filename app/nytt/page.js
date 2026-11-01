"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { shrink } from "@/lib/image";
import { useRecipes } from "@/components/useRecipes";
import { findDuplicate } from "@/lib/dupes";
import ReviewForm from "@/components/ReviewForm";
import { useApp } from "@/components/Providers";

const MAX_BYTES = 4 * 1024 * 1024;

function b64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(new Error("Filen gick inte att läsa."));
    r.readAsDataURL(file);
  });
}
async function prepare(files) {
  const out = [];
  for (const f of files) {
    const n = (f.name || "").toLowerCase();
    if (/^image\//.test(f.type) || /\.(heic|heif|jpe?g|png|webp)$/.test(n)) out.push({ mediaType: "image/jpeg", data: await shrink(f) });
    else if (f.type === "application/pdf" || n.endsWith(".pdf")) {
      if (f.size > MAX_BYTES) throw new Error("PDF:en är för stor. Den får vara högst 4 MB.");
      out.push({ mediaType: "application/pdf", data: await b64(f) });
    } else if (/^text\//.test(f.type) || /\.(txt|md)$/.test(n)) out.push({ mediaType: "text/plain", text: await f.text() });
    else throw new Error(`Filtypen för ${f.name} går inte att läsa. Använd bild, PDF eller textfil.`);
  }
  return out;
}

function Importer() {
  const router = useRouter();
  const params = useSearchParams();
  const { recipes } = useRecipes();
  const { toast } = useApp();
  const [mode, setMode] = useState("link");
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [exists, setExists] = useState(null); // { dup, input }
  const [saving, setSaving] = useState(false);
  const started = useRef(false);
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (started.current) return;
    const u = params.get("url"), d = params.get("utkast"), ide = params.get("ide");
    if (ide) {
      started.current = true;
      setText(ide);
      run({ text: ide });
    } else if (d) {
      started.current = true;
      api(`/api/drafts/${d}`).then((x) => { setDraft(x.recipe); setDraftId(d); }).catch((e) => setError(e.message));
    } else if (u) {
      started.current = true;
      const link = u.match(/https?:\/\/\S+/)?.[0] || u;
      setUrl(link);
      run({ url: link });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function run(input) {
    setBusy(true); setError("");
    try {
      setStatus(input.url && !input.text ? "Hämtar sidan och läser receptet …" : input.files?.length ? "Claude läser receptet … det tar oftast under en minut" : "Claude läser receptet …");
      const d = await api("/api/import", { method: "POST", json: input });
      if (d.duplicate) { setExists({ dup: d.duplicate, input }); return; }
      setExists(null);
      setDraft(d.recipe);
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false); setStatus("");
    }
  }
  async function go() {
    if (mode === "link") {
      if (!url.trim() && !text.trim()) { setError("Klistra in en länk eller receptets text."); return; }
      run({ url: url.trim() || null, text: text.trim() || null });
    } else {
      try { setStatus("Förbereder …"); const prepared = await prepare(files.map((f) => f.file)); run({ files: prepared }); }
      catch (e) { setStatus(""); setError(e.message); }
    }
  }
  function addFiles(list) {
    const arr = Array.from(list || []);
    setFiles((cur) => [...cur, ...arr.map((f) => ({ file: f, thumb: /^image\//.test(f.type) ? URL.createObjectURL(f) : null }))].slice(0, 8));
    setError("");
  }
  async function save(recipe) {
    setSaving(true);
    try {
      const { id } = await api("/api/recipes", { method: "POST", json: { recipe } });
      if (draftId) await api(`/api/drafts/${draftId}`, { method: "DELETE" }).catch(() => {});
      toast(`${recipe.title} är sparat`);
      router.replace(`/recept/${id}`);
    } catch (e) {
      toast(e.message); setSaving(false);
    }
  }
  async function discard() {
    if (draftId) await api(`/api/drafts/${draftId}`, { method: "DELETE" }).catch(() => {});
    setDraft(null); setDraftId(null); setFiles([]);
    if (draftId) router.replace("/");
  }

  if (draft) {
    const dup = findDuplicate(recipes || [], { url: draft.source?.url, title: draft.title });
    return <ReviewForm recipe={draft} recipes={recipes || []} onSave={save} onDiscard={discard} busy={saving}
      dupWarning={dup ? <>{dup.why === "url" ? "Det här receptet finns redan, från samma länk: " : "Det finns redan ett recept som verkar vara samma: "}<Link href={`/recept/${dup.id}`}>{dup.title}</Link>. Spara bara om ni vill ha båda.</> : null} />;
  }

  if (exists) {
    const { dup, input } = exists;
    return (
      <div className="narrow">
        <div className="hero"><h1>Finns redan</h1></div>
        <div className="panel">
          <p style={{ margin: 0 }}>{dup.kind === "draft" ? <>Receptet från den här länken väntar redan på granskning: <b>{dup.title}</b>.</> : <>Receptet från den här länken finns redan i Receptboken: <b>{dup.title}</b>.</>}</p>
          <div className="arow">
            {dup.kind === "draft"
              ? <button className="btn" type="button" onClick={() => api(`/api/drafts/${dup.id}`).then((x) => { setExists(null); setDraft(x.recipe); setDraftId(dup.id); }).catch((e) => setError(e.message))}>Granska utkastet</button>
              : <Link className="btn" href={`/recept/${dup.id}`}>Öppna receptet</Link>}
            <button className="btn ghost" type="button" onClick={() => { setExists(null); run({ ...input, force: true }); }}>Läs in en gång till ändå</button>
            <button className="link" type="button" onClick={() => { setExists(null); setUrl(""); }}>Avbryt</button>
          </div>
        </div>
      </div>
    );
  }

  const canGo = mode === "link" ? !!(url.trim() || text.trim()) : files.length > 0;
  return (
    <div className="narrow">
      <div className="hero"><h1>Nytt recept</h1>
        <p className="muted" style={{ margin: 0 }}>Klistra in en länk, fota en receptsida eller välj en fil. Claude gör receptet i Receptbokens stil med förbättringar, och du granskar innan det sparas.</p>
      </div>
      <div className="modes" role="tablist">
        {[["link", "Länk eller text", "Från Köket.se, Arla eller vilken receptsida som helst"], ["photo", "Fota", "Kokbok, tidning eller handskrivet"], ["file", "Fil", "Bild, PDF eller textfil"]].map(([k, t, d]) => (
          <button key={k} type="button" role="tab" className="mode" aria-selected={mode === k} onClick={() => { setMode(k); setFiles([]); setError(""); }}><b>{t}</b><span>{d}</span></button>
        ))}
      </div>
      <div className="panel">
        {mode === "link" && (<>
          <label className="fld"><span>Länk till receptet</span>
            <input id="url-in" className="tin" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.koket.se/..." autoComplete="off" />
          </label>
          <label className="fld"><span>Eller klistra in receptets text</span>
            <textarea id="text-in" className="tin" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Behövs bara om länken inte går att läsa" />
          </label>
        </>)}
        {mode === "photo" && (<>
          <div className="arow">
            <label className="btn big" htmlFor="cam-in">Ta foto</label>
            <label className="btn ghost big" htmlFor="lib-in">Välj bild</label>
          </div>
          <input id="cam-in" className="vh" type="file" accept="image/*" capture="environment" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <input id="lib-in" className="vh" type="file" accept="image/*" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <p className="hint">Går receptet över flera sidor kan du ta flera foton, de läses tillsammans. Fota rakt ovanifrån i bra ljus.</p>
        </>)}
        {mode === "file" && (<>
          <label className={"drop" + (over ? " over" : "")} htmlFor="file-in"
            onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}>
            <b>Välj en fil</b><span className="muted">eller släpp den här. Bild, PDF, .txt eller .md</span>
          </label>
          <input id="file-in" className="vh" type="file" multiple accept="image/*,application/pdf,.pdf,.txt,.md,text/plain" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        </>)}
        {files.length > 0 && (
          <ul className="flist">
            {files.map((f, i) => (
              <li key={i}>
                {f.thumb ? <img src={f.thumb} alt="" /> : <span className="ficon">{(f.file.name.split(".").pop() || "fil").toUpperCase()}</span>}
                <span className="fname">{f.file.name || "Foto"}</span>
                <button type="button" className="link" onClick={() => setFiles(files.filter((_, j) => j !== i))}>Ta bort</button>
              </li>
            ))}
          </ul>
        )}
        <div className="arow">
          <button className="btn" type="button" disabled={busy || !canGo} onClick={go}>Läs in receptet</button>
          {(busy || status) && <span className="muted"><span className="spinner" />{status}</span>}
          {error && <span className="err">{error}</span>}
        </div>
      </div>
      <p className="hint" style={{ marginTop: "1rem" }}>Vill du skicka recept direkt från Safari? <Link href="/genvag">Så lägger du till genvägen</Link>.</p>
    </div>
  );
}

export default function NewRecipe() {
  return <Suspense><Importer /></Suspense>;
}
