import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const dir = './src/content/factions';
const files = readdirSync(dir).filter(f => f.endsWith('.yml'));

for (const file of files) {
  const path = `${dir}/${file}`;
  const data = yaml.load(readFileSync(path, 'utf8'));

  // Sbírám CS hodnoty
  const csI18n = data.i18n?.cs ?? {};
  const cs = {
    name: csI18n.name,
    tagline: csI18n.tagline,
    combat_style: data.combat_style,
    recommended_for: data.recommended_for,
    not_recommended_for: data.not_recommended_for,
    tags: data.tags,
    newbie_costume_hint: data.newbie_costume_hint,
    camp_hook: data.camp_hook,
    costume_colors_text: data.costume_colors_text,
    heraldry_text: data.heraldry_text,
    ruler: data.ruler ? {
      name: data.ruler.name,
      title: data.ruler.title,
      description: data.ruler.description,
    } : undefined,
    lore_sections: data.lore_sections,
  };

  // Build new i18n: full schema + cs has all values, others copy cs
  const newI18n = {};
  for (const lang of ['cs', 'en', 'de', 'sk', 'uk']) {
    const existing = data.i18n?.[lang] ?? {};
    newI18n[lang] = {
      name: existing.name ?? cs.name,
      tagline: existing.tagline ?? cs.tagline,
      combat_style: cs.combat_style,
      recommended_for: cs.recommended_for,
      not_recommended_for: cs.not_recommended_for,
      tags: cs.tags,
      newbie_costume_hint: cs.newbie_costume_hint,
      camp_hook: cs.camp_hook,
      costume_colors_text: cs.costume_colors_text,
      heraldry_text: cs.heraldry_text,
      ...(cs.ruler ? { ruler: cs.ruler } : {}),
      lore_sections: cs.lore_sections,
    };
  }

  // Remove original top-level fields, keep only structural
  const newData = {
    side: data.side,
    i18n: newI18n,
    colors: data.colors,
    emblem: data.emblem,
    emblem_image: data.emblem_image,
    difficulty_for_newcomer: data.difficulty_for_newcomer,
    costume_difficulty: data.costume_difficulty,
    roleplay_difficulty: data.roleplay_difficulty,
    order: data.order,
    hero_image: data.hero_image,
    card_image: data.card_image,
  };
  // Remove undefined
  Object.keys(newData).forEach(k => newData[k] === undefined && delete newData[k]);

  writeFileSync(path, yaml.dump(newData, { lineWidth: -1, noRefs: true }));
  console.log(`  ${file}: migrated`);
}
