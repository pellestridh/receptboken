"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// "+" öppnar en liten meny: nytt recept, inspiration och inställningar.
function More({ active }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <span className="navmore" ref={ref}>
      <button type="button" className="tab add-tab" aria-current={active ? "page" : undefined} aria-expanded={open} aria-haspopup="menu" aria-label="Mer" onClick={() => setOpen(!open)}><span className="ti" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>` }} /><span className="tl">Mer</span></button>
      {open && (
        <span className="moremenu" role="menu">
          <Link role="menuitem" href="/nytt"><b>Nytt recept</b><span>Länk, foto eller fil</span></Link>
          <Link role="menuitem" href="/erbjudanden"><b>Erbjudanden</b><span>Veckans priser och recept som passar</span></Link>
          <a role="menuitem" href="/pizza?vy=kvall"><b>Pizzakväll</b><span>Pizzatavlan: välj pizzor, deg och pålägg räknas ut</span></a>
          <a role="menuitem" href="/pizza"><b>Pizzadeg</b><span>Degkalkylator för dagjäst och napolitansk</span></a>
          <Link role="menuitem" href="/fest"><b>Fest och buffé</b><span>Hur mycket ska vi laga till gästerna?</span></Link>
          <Link role="menuitem" href="/inspiration"><b>Inspiration</b><span>Recept från de andra hushållen</span></Link>
          <Link role="menuitem" href="/installningar"><b>Inställningar</b><span>Allergier, hushåll, namn och utloggning</span></Link>
        </span>
      )}
    </span>
  );
}

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  if (path === "/login") return null;
  const at = (p) => (p === "/" ? path === "/" : path.startsWith(p));
  return (
    <nav className="nav">
      <div className="wrap navrow">
        {path !== "/" && (
          <button type="button" className="hbtn" aria-label="Tillbaka" onClick={() => router.back()}>‹</button>
        )}
        <Link href="/" className={"brand" + (path === "/" ? " home" : "")} aria-label="Receptboken, startsidan">
          <img src="/logo-240.png" alt="" width="40" height="40" className="logo" /><span>Receptboken</span>
        </Link>
        <div className="tabs">
          <Link href="/" className="tab" aria-current={at("/") || at("/recept") ? "page" : undefined}><span className="ti" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></svg>` }} /><span className="tl">Recept</span></Link>
          <Link href="/meny" className="tab" aria-current={at("/meny") ? "page" : undefined}><span className="ti" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>` }} /><span className="tl">Meny</span></Link>
          <Link href="/inkop" className="tab" aria-current={at("/inkop") ? "page" : undefined}><span className="ti" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h2l2 11h10l2-8H7"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>` }} /><span className="tl">Inköp</span></Link>
          <Link href="/dryck" className="tab" aria-current={at("/dryck") ? "page" : undefined}><span className="ti" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10l-1 7a4 4 0 0 1-8 0z"/><path d="M12 14v6M8 21h8"/></svg>` }} /><span className="tl">Dryck</span></Link>
          <More active={at("/nytt") || at("/pizza") || at("/fest") || at("/erbjudanden") || at("/inspiration") || at("/installningar")} />
        </div>
      </div>
    </nav>
  );
}
