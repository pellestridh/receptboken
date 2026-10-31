# Receptboken

Familjens recept, matsedel och inköpslista. Next.js på Vercel, Neon Postgres och Claude API.

## Etapp 1 innehåller

- Receptlista med sökning, filter och sortering, och förslag för ikväll och helgen
- Kökläge med bockbara ingredienser och moment, timers, portioner och tänd skärm
- Betyg, "vi lagade den idag" och anteckningar
- Gemensam inköpslista sorterad efter butikens avdelningar
- Läs in recept från länk, foto, PDF, textfil eller inklistrad text, med granskning före sparning
- Ändra ett recept med Claude, koppla ihop rätter som passar ihop, ta bort recept
- Genväg från Safari (`/genvag`) och installation på hemskärmen

## Driftsättning

1. Importera repot i Vercel (Add New → Project).
2. Lägg till en Neon-databas under Storage. `DATABASE_URL` sätts automatiskt.
3. Sätt miljövariablerna `FAMILY_CODE`, `SHORTCUT_KEY` och `ANTHROPIC_API_KEY` under Settings → Environment Variables.
4. Publicera om. Tabellerna skapas och recepten i `data/seed.json` läggs in vid första bygget (`scripts/migrate.mjs`).

Varje push till `main` publiceras automatiskt.

## Lokalt

```
npm install
cp .env.example .env.local   # fyll i värdena
npm run migrate
npm run dev
```

Kravspec: se dokumentet "Receptboken – kravspec".
