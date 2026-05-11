/**
 * Mapování slug frakce/role → název SVG ikony v /public/images/ikony-narody/.
 * Datum: 2026-05-02
 *
 * Slugy frakcí jsou nyní sjednocené (elfove, trpaslici, atd. — viz refactor).
 * Vrchovina mapuje na 'horale' (původní docx materiály), hobiti na 'hobite',
 * fotografove-a-kameramani na 'fotografove'. Ostatní jsou identity.
 * Pokud slug neobsahuje, vrátí slug samotný (kebab-case shoda).
 */

const FACTION_TO_ICON: Record<string, string> = {
  // Frakce
  gondor: 'gondor',
  rohan: 'rohan',
  elfove: 'elfove',
  trpaslici: 'trpaslici',
  skreti: 'skreti',
  skuruti: 'skuruti',
  harad: 'harad',
  umbar: 'umbar',
  vrchovina: 'horale',
  // Role
  hobiti: 'hobite',
  'detska-hra': 'detska-hra',
  'nebojovy-doprovod': 'nebojovy-doprovod',
  'fotografove-a-kameramani': 'fotografove',
  stankari: 'stankari',
  pomocnici: 'pomocnici',
};

export function factionIconSlug(slug: string): string {
  return FACTION_TO_ICON[slug] ?? slug;
}

export function hasFactionIcon(slug: string): boolean {
  return slug in FACTION_TO_ICON;
}
