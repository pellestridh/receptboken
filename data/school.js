// Samlar kurserna för öl och vin med samma struktur.
import { LESSONS } from "@/data/wine";
import { WINE_ADV_LESSONS } from "@/data/wineExtra";
import { BEER_LESSONS } from "@/data/beerSchool";

export const SCHOOL = {
  wine: { name: "Vin", lessons: [...LESSONS.map((l) => ({ ...l, level: "grund" })), ...WINE_ADV_LESSONS], progressKey: "wineProgress" },
  beer: { name: "Öl", lessons: BEER_LESSONS, progressKey: "beerProgress" },
};
export const lessonFor = (kind, key) => SCHOOL[kind]?.lessons.find((l) => l.key === key) || null;
