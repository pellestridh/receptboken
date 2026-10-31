import { db } from "@/lib/db";

export async function loadMenus(limit = 8) {
  const sql = db();
  const menus = await sql(`select id, kind, title, start_date, servings, created_at from menus order by start_date desc nulls last, created_at desc limit $1`, [limit]);
  if (!menus.length) return [];
  const items = await sql(
    `select i.id, i.menu_id, i.recipe_id, i.day, i.course, i.servings, i.position,
            r.title, r.image_url, r.accent, r.minutes, r.kitchen
     from menu_items i left join recipes r on r.id = i.recipe_id and r.deleted_at is null
     where i.menu_id = any($1) order by i.position`,
    [menus.map((m) => m.id)]
  );
  const day = (d) => (d ? (typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10)) : null);
  return menus.map((m) => ({
    id: m.id, kind: m.kind, title: m.title, startDate: day(m.start_date), servings: m.servings,
    items: items.filter((i) => i.menu_id === m.id).map((i) => ({
      id: i.id, recipeId: i.title ? i.recipe_id : null, day: day(i.day), course: i.course, servings: i.servings,
      title: i.title, image: i.image_url, accent: i.accent, minutes: i.minutes, kitchen: i.kitchen,
    })),
  }));
}
