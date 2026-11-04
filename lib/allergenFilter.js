// "Kan innehålla" gäller bara färdiga produkter där nötter faktiskt brukar ingå. Ost, kött, chark,
// grönsaker, mjöl och liknande råvaror räknas aldrig, även om Claude skulle föreslå det.
export const RISKY = /pesto|curry|korma|tikka|müsli|musli|granola|nougat|pralin|baklava|dukkah|marsipan|choklad|kex|kakor|kaka|tårta|glass|crunch|crumble|nötmix|nötsmör|satay|\bmole\b|romesco|dukka|halva|tahini/i;
export const realMay = (list) => (list || []).filter((m) => RISKY.test(`${m.ingredient || ""}`));

