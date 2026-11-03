"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getName, lsGet, lsSet } from "@/lib/api";
import { CURRENT } from "@/data/releases";

// Nyhetsrutan: visas en gång per person och enhet efter en ny version.
export default function NewsBox() {
  const [show, setShow] = useState(false);
  const key = () => `rb-seen-${(getName() || "alla").toLowerCase()}`;
  const stamp = `${CURRENT.version}.${CURRENT.rev || 1}`;
  useEffect(() => { if (CURRENT.news?.length && lsGet(key(), "") !== stamp) setShow(true); }, []);
  if (!show) return null;
  const close = () => { lsSet(key(), stamp); setShow(false); };
  return (
    <aside className="newsbox" aria-label="Nyheter">
      <div className="nb-h"><span className="nb-tag">Nytt i version {CURRENT.version}</span><button type="button" className="nb-x" aria-label="Stäng" onClick={close}>✕</button></div>
      <b className="nb-t">{CURRENT.title}</b>
      <ul>{CURRENT.news.map((n) => <li key={n}>{n}</li>)}</ul>
      {CURRENT.newsFixed?.length > 0 && <><b className="nb-s">Rättat</b><ul>{CURRENT.newsFixed.map((n) => <li key={n}>{n}</li>)}</ul></>}
      <p className="nb-f"><Link href="/om" onClick={close}>Allt som är nytt ›</Link><button type="button" className="link" onClick={close}>Okej, tack</button></p>
    </aside>
  );
}
