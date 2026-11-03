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
      <button type="button" className="tab add-tab" aria-current={active ? "page" : undefined} aria-expanded={open} aria-haspopup="menu" aria-label="Mer" onClick={() => setOpen(!open)}>+<span className="tlong"> Mer</span></button>
      {open && (
        <span className="moremenu" role="menu">
          <Link role="menuitem" href="/nytt"><b>Nytt recept</b><span>Länk, foto eller fil</span></Link>
          <Link role="menuitem" href="/erbjudanden"><b>Erbjudanden</b><span>Veckans priser och recept som passar</span></Link>
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
          <Link href="/" className="tab" aria-current={at("/") || at("/recept") ? "page" : undefined}>Recept</Link>
          <Link href="/meny" className="tab" aria-current={at("/meny") ? "page" : undefined}>Meny</Link>
          <Link href="/inkop" className="tab" aria-current={at("/inkop") ? "page" : undefined}>Inköp</Link>
          <Link href="/dryck" className="tab" aria-current={at("/dryck") ? "page" : undefined}>Dryck</Link>
          <More active={at("/nytt") || at("/fest") || at("/erbjudanden") || at("/inspiration") || at("/installningar")} />
        </div>
      </div>
    </nav>
  );
}
