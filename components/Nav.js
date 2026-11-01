"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
          <Link href="/nytt" className="tab add-tab" aria-current={at("/nytt") ? "page" : undefined} aria-label="Nytt recept">+<span className="tlong"> Nytt</span></Link>
        </div>
      </div>
    </nav>
  );
}
