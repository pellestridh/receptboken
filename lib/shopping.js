export function shoppingItems(r, servings) {
  const f = (servings || r.servings) / (r.servings || 1);
  return (r.groups || []).flatMap((g) => g.items)
    .filter((it) => it.shop !== false)
    .map((it) => ({
      name: it.name, unit: it.unit || "", amt: it.amt || "", pantry: !!it.pantry, from: r.title,
      q: it.q == null ? null : it.q * f, q2: it.q2 == null ? null : it.q2 * f,
    }));
}
