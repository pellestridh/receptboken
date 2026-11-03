// Samlar kurserna för öl och vin med samma struktur. Numreringen räknas fram här.
import { LESSONS } from "@/data/wine";
import { WINE_ADV_LESSONS } from "@/data/wineExtra";
import { BEER_LESSONS } from "@/data/beerSchool";
import { DESCRIBE_LESSONS } from "@/data/describe";

// "Så beskriver man" läggs direkt efter den första lektionen om att prova.
const withDescribe = (list, d) => [list[0], d, ...list.slice(1)].map((l, i) => ({ ...l, n: i + 1 }));

export const SCHOOL = {
  wine: { name: "Vin", lessons: withDescribe([...LESSONS.map((l) => ({ ...l, level: "grund" })), ...WINE_ADV_LESSONS], DESCRIBE_LESSONS.wine), progressKey: "wineProgress" },
  beer: { name: "Öl", lessons: withDescribe(BEER_LESSONS, DESCRIBE_LESSONS.beer), progressKey: "beerProgress" },
};
export const lessonFor = (kind, key) => SCHOOL[kind]?.lessons.find((l) => l.key === key) || null;
