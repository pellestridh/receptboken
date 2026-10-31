import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default function Shortcut() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "receptboken.vercel.app";
  const base = `https://${host}`;
  const key = process.env.SHORTCUT_KEY;
  return (
    <div className="narrow">
      <div className="hero"><h1>Dela från Safari</h1>
        <p className="muted" style={{ margin: 0 }}>Med en iOS-genväg skickar du ett recept från Safari till Receptboken med två tryck: Dela, sedan Till Receptboken. Gör så här en gång på varje iPhone och iPad.</p>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: "1.4rem" }}>Skapa genvägen</h2>
        <ol style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: ".5rem" }}>
          <li>Öppna appen <b>Genvägar</b> och tryck på <b>+</b>.</li>
          <li>Tryck på genvägens namn högst upp och döp den till <b>Till Receptboken</b>.</li>
          <li>Tryck på <b>i</b> eller inställningsikonen och slå på <b>Visa i delningsblad</b>. Välj att den tar emot <b>URL:er</b> och <b>Safari-webbsidor</b>.</li>
          <li>Lägg till åtgärden <b>Hämta innehåll från URL</b>. Som URL skriver du adressen nedan, och efter <code>url=</code> lägger du in variabeln <b>Genvägsindata</b>.</li>
          <li>Lägg till åtgärden <b>Visa resultat</b>, så ser du när receptet är inläst.</li>
        </ol>
        <label className="fld"><span>Adress till genvägen</span>
          <input className="tin" readOnly value={key ? `${base}/api/shortcut?key=${key}&url=` : "SHORTCUT_KEY är inte satt i Vercel än"} onFocus={(e) => e.target.select()} />
        </label>
        <p className="hint">Receptet läses in i bakgrunden, det tar runt en minut. Sedan ligger det överst i Receptboken och väntar på att du granskar och sparar det. Adressen innehåller er nyckel, så dela den inte med andra.</p>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: "1.4rem" }}>Enklare variant</h2>
        <p className="hint">Vill du hellre se inläsningen direkt: använd åtgärden <b>Öppna URL:er</b> i stället, med adressen <code>{base}/nytt?url=</code> följd av Genvägsindata. Då öppnas Receptboken i Safari och läser in receptet medan du tittar. Första gången behöver du logga in i Safari.</p>
      </div>
    </div>
  );
}
