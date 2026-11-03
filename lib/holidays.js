// Högtider. Claude märker recepten; gissningen används tills dess.
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}
function midsummerEve(y) { const d = new Date(y, 5, 19); while (d.getDay() !== 5) d.setDate(d.getDate() + 1); return d; }

export const HOLIDAYS = [
  { key: "jul", name: "Jul", color: "ember", date: (y) => new Date(y, 11, 24), lead: 40,
    guess: /jul|lussekatt|lussebull|saffran|pepparkak|glögg|janssons|julskink|skinka.*sen?ap|revbensspjäll|prinskorv|rödbetssallad|risgrynsgröt|ris à la malta|ris a la malta|lutfisk|sylta|knäck|kola\b|grisfötter|dopp i grytan/ },
  { key: "nyar", name: "Nyårsafton", color: "plum", date: (y) => new Date(y, 11, 31), lead: 14,
    guess: /nyår|hummer|ostron|toast skagen|löjrom|kaviar|champagne/ },
  { key: "pask", name: "Påsk", color: "dijon", date: easter, lead: 25,
    guess: /påsk|lammstek|lammbog|gravad lax|ägghalvor|fyllda ägg|janssons|sillsallad|påskmust|semla/ },
  { key: "midsommar", name: "Midsommar", color: "spinach", date: midsummerEve, lead: 25,
    guess: /midsommar|sill|färskpotatis|jordgubbstårta|jordgubb|västerbotten.*paj|gräddfil.*gräslök|grillat|nubbe/ },
  { key: "alla-hjartans", name: "Alla hjärtans dag", color: "plum", date: (y) => new Date(y, 1, 14), lead: 14,
    guess: /alla hjärtan|hjärta|chokladfondant|fondant|moelleux|ostron|tryffel/ },
];
export const HOLIDAY_KEYS = HOLIDAYS.map((h) => h.key);
export const HOLIDAY_NAME = Object.fromEntries(HOLIDAYS.map((h) => [h.key, h.name]));

// Egen märkning vinner, även en tom lista. Annars en försiktig gissning på titeln.
export function holidaysOf(r) {
  if (Array.isArray(r.holidays)) return r.holidays.filter((k) => HOLIDAY_KEYS.includes(k));
  const t = String(r.title || "").toLowerCase();
  return HOLIDAYS.filter((h) => h.guess.test(t)).map((h) => h.key);
}

// Nästa högtid inom sin framförhållning, med antal dagar kvar.
export function upcomingHoliday(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let best = null;
  for (const h of HOLIDAYS) for (const y of [today.getFullYear(), today.getFullYear() + 1]) {
    const d = h.date(y);
    const days = Math.round((d - today) / 86400000);
    if (days >= -1 && days <= h.lead && (!best || days < best.days)) best = { ...h, days, when: d };
  }
  return best;
}
