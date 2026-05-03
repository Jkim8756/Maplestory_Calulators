import type { Boss, BossData } from '../types/boss';
import wikiBossSnapshot from './wiki/bosses.snapshot.json';

export const BOSS_STORAGE_KEY = 'ms_calc_bosses_override';
export const CRYSTALS_PER_CHARACTER_CAP = 14;
export const CRYSTALS_ACCOUNT_CAP = 180;

type WikiDifficultyDrops = {
  categories?: Partial<Record<'equipment' | 'usable' | 'setup' | 'etc' | 'quest', string[]>>;
  flat?: string[];
};

type WikiBossEntry = {
  name: string;
  localImagePath: string;
  levels: Partial<Record<Boss['difficulty'], number | null>>;
  dropsByDifficulty?: Partial<Record<Boss['difficulty'], WikiDifficultyDrops>>;
};

const WIKI_BOSS_ALIASES: Record<string, string> = {
  Akechi: 'Akechi Mitsuhide',
  'Empress (Cygnus)': 'Cygnus',
};

const WIKI_BOSS_BY_NAME = new Map(
  (wikiBossSnapshot.bosses as WikiBossEntry[]).map((boss) => [boss.name, boss])
);

const BOSS_META: Record<string, { levelRequirement: number; themeColor: string; thumbnailUrl?: string; inGameTier?: string }> = {
  Zakum: { levelRequirement: 50, themeColor: '#a855f7' },
  Horntail: { levelRequirement: 130, themeColor: '#f97316' },
  'Pink Bean': { levelRequirement: 160, themeColor: '#ec4899' },
  Hilla: { levelRequirement: 120, themeColor: '#7c3aed' },
  'Von Leon': { levelRequirement: 125, themeColor: '#64748b' },
  Arkarium: { levelRequirement: 140, themeColor: '#334155' },
  Magnus: { levelRequirement: 155, themeColor: '#2563eb' },
  Papulatus: { levelRequirement: 155, themeColor: '#06b6d4' },
  Pierre: { levelRequirement: 180, themeColor: '#ef4444' },
  'Von Bon': { levelRequirement: 180, themeColor: '#14b8a6' },
  'Crimson Queen': { levelRequirement: 180, themeColor: '#dc2626' },
  Vellum: { levelRequirement: 180, themeColor: '#ca8a04' },
  'Empress (Cygnus)': { levelRequirement: 170, themeColor: '#38bdf8' },
  'Princess No': { levelRequirement: 140, themeColor: '#db2777' },
  'Mori Ranmaru': { levelRequirement: 120, themeColor: '#94a3b8' },
  'OMNI-CLN': { levelRequirement: 180, themeColor: '#65a30d' },
  Akechi: { levelRequirement: 200, themeColor: '#475569' },
  'Guardian Angel Slime': { levelRequirement: 210, themeColor: '#22c55e', thumbnailUrl: 'https://media.maplestorywiki.net/yetidb/Maple_Guide_-_Guardian_Angel_Slime.png' },
  Lotus: { levelRequirement: 190, themeColor: '#475569' },
  Damien: { levelRequirement: 190, themeColor: '#7c2d12' },
  Lucid: { levelRequirement: 220, themeColor: '#f472b6' },
  Will: { levelRequirement: 235, themeColor: '#6366f1' },
  Gloom: { levelRequirement: 245, themeColor: '#0f172a' },
  'Verus Hilla': { levelRequirement: 250, themeColor: '#be123c' },
  Darknell: { levelRequirement: 255, themeColor: '#111827' },
  'Chosen Seren': { levelRequirement: 260, themeColor: '#f59e0b', thumbnailUrl: 'https://media.maplestorywiki.net/yetidb/Maple_Guide_-_Chosen_Seren.png' },
  Kalos: { levelRequirement: 265, themeColor: '#0ea5e9', thumbnailUrl: 'https://media.maplestorywiki.net/yetidb/Maple_Guide_-_Kalos_the_Guardian.png' },
  Kaling: { levelRequirement: 275, themeColor: '#9333ea', thumbnailUrl: 'https://media.maplestorywiki.net/yetidb/Maple_Guide_-_Kaling.png' },
  'First Adversary': { levelRequirement: 270, themeColor: '#4f46e5', thumbnailUrl: 'https://media.maplestorywiki.net/yetidb/Maple_Guide_-_First_Adversary.png' },
  Limbo: { levelRequirement: 285, themeColor: '#164e63', thumbnailUrl: 'https://media.maplestorywiki.net/yetidb/Maple_Guide_-_Limbo.png' },
  Baldrix: { levelRequirement: 290, themeColor: '#b45309', thumbnailUrl: 'https://media.maplestorywiki.net/yetidb/Maple_Guide_-_Baldrix.png' },
  'Black Mage': { levelRequirement: 255, themeColor: '#1f2937', thumbnailUrl: 'https://media.maplestorywiki.net/yetidb/Maple_Guide_-_Black_Mage.png' },
};

function bossThumbnail(name: string, themeColor: string): string {
  const initials = name
    .replace(/\([^)]*\)/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="22" fill="#f8fafc"/><circle cx="48" cy="44" r="31" fill="${themeColor}"/><path d="M24 67c8-10 16-15 24-15s16 5 24 15" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><text x="48" y="49" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PARTY_LIMIT_3 = new Set(['First Adversary', 'Limbo', 'Baldrix']);

const TIER_BY_ID: Record<string, string> = {
  'extreme-kaling': '10',
  'hard-baldrix': '9',
  'extreme-first-adversary': '9',
  'easy-kalos': '9',
  'hard-chosen-seren': '9',
  'easy-first-adversary': '9',
  'extreme-kalos': '8',
  'hard-black-mage': '7',
  'extreme-black-mage': '10',
  'extreme-chosen-seren': '7',
  'hard-limbo': '7',
  'hard-verus-hilla': '7',
  'normal-chosen-seren': '7',
  'hard-kaling': '6',
  'hard-first-adversary': '6',
  'chaos-gloom': '6',
  'hard-darknell': '6',
  'chaos-kalos': '5',
  'normal-baldrix': '5',
  'hard-lucid': '5',
  'hard-will': '5',
  'normal-kaling': '4',
  'normal-limbo': '4',
  'normal-lucid': '3',
  'normal-will': '3',
  'extreme-lotus': '2',
  'hard-damien': '2',
  'hard-lotus': '2',
  'normal-gloom': '1',
  'normal-darknell': '1',
  'normal-kalos': '1',
  'normal-first-adversary': '1',
  'easy-kaling': '1',
  'easy-lucid': '6',
  'easy-will': '6',
  'chaos-guardian-angel-slime': '6',
  'chaos-papulatus': '5',
  'normal-lotus': '5',
  'normal-damien': '5',
  'normal-akechi': '5',
  'princess-no': '5',
  'chaos-vellum': '4',
  'hard-magnus': '4',
  'chaos-pierre': '3',
  'chaos-von-bon': '3',
  'chaos-crimson-queen': '3',
  'normal-empress': '2',
  'chaos-zakum': '2',
  'hard-von-leon': '1',
  'normal-von-leon': '1',
  'normal-papulatus': '1',
  'hard-mori-ranmaru': '1',
  'normal-omni-cln': '6',
  'chaos-horntail': '6',
  'normal-pink-bean': '6',
  'normal-horntail': '5',
  'easy-horntail': '5',
  'easy-arkarium': '5',
  'normal-arkarium': '5',
  'normal-pierre': '4',
  'normal-von-bon': '4',
  'normal-crimson-queen': '4',
  'normal-vellum': '4',
  'normal-hilla': '3',
  'easy-hilla': '3',
  'normal-mori-ranmaru': '3',
  'easy-papulatus': '2',
  'normal-zakum': '1',
  'easy-zakum': '1',
};

function withBossMeta(bosses: Boss[]): Boss[] {
  return bosses.map((boss) => {
    const meta = BOSS_META[boss.name] ?? { levelRequirement: 0, themeColor: '#64748b' };
    const wikiBoss = WIKI_BOSS_BY_NAME.get(WIKI_BOSS_ALIASES[boss.name] ?? boss.name);
    return {
      ...boss,
      levelRequirement: wikiBoss?.levels[boss.difficulty] ?? meta.levelRequirement,
      inGameTier: TIER_BY_ID[boss.id] ?? meta.inGameTier ?? '',
      partyLimit: PARTY_LIMIT_3.has(boss.name) ? 3 : 6,
      drops: selectImportantDrops(wikiBoss?.dropsByDifficulty?.[boss.difficulty]) ?? boss.drops,
      themeColor: meta.themeColor,
      thumbnailUrl: wikiBoss?.localImagePath ?? meta.thumbnailUrl ?? bossThumbnail(boss.name, meta.themeColor),
    };
  });
}

function selectImportantDrops(dropData: WikiDifficultyDrops | undefined): string[] | undefined {
  if (!dropData) return undefined;
  const equipment = dropData.categories?.equipment ?? [];
  const etc = (dropData.categories?.etc ?? []).filter(isImportantEtcDrop);
  const usable = (dropData.categories?.usable ?? []).filter(isImportantUsableDrop);
  const combined = [...equipment, ...usable, ...etc]
    .map((drop) => drop.replace(/\s+/g, ' ').trim())
    .filter((drop) => drop && drop !== 'None');
  return combined.length > 0 ? [...new Set(combined)] : undefined;
}

function isImportantEtcDrop(drop: string): boolean {
  if (/Intense Power Crystal|Spell Trace/i.test(drop)) return false;
  return /Fragment|Piece|Essence|Energy|Symbol|Droplet|Crystal|Badge|Emblem|Stone|Source|Butterfly|Crest|Spark|Twisted Time/i.test(drop);
}

function isImportantUsableDrop(drop: string): boolean {
  if (/Potion|Cube|Flame|Scroll|Medal|Coupon|Elixir|Soul Enchanter/i.test(drop)) return false;
  return /Ring Box|Box|Recipe|Sol Erda/i.test(drop);
}

export const DEFAULT_BOSSES: Boss[] = withBossMeta([
  { id: 'easy-zakum', name: 'Zakum', difficulty: 'Easy', frequency: 'daily', mesoReboot: 1_000_000, crystalCount: 1 },
  { id: 'normal-zakum', name: 'Zakum', difficulty: 'Normal', frequency: 'daily', mesoReboot: 3_062_500, crystalCount: 1 },
  { id: 'easy-horntail', name: 'Horntail', difficulty: 'Easy', frequency: 'daily', mesoReboot: 4_410_000, crystalCount: 1 },
  { id: 'normal-horntail', name: 'Horntail', difficulty: 'Normal', frequency: 'daily', mesoReboot: 5_062_500, crystalCount: 1 },
  { id: 'chaos-horntail', name: 'Horntail', difficulty: 'Chaos', frequency: 'daily', mesoReboot: 6_760_000, crystalCount: 1 },
  { id: 'normal-pink-bean', name: 'Pink Bean', difficulty: 'Normal', frequency: 'daily', mesoReboot: 7_022_500, crystalCount: 1 },
  { id: 'easy-hilla', name: 'Hilla', difficulty: 'Easy', frequency: 'daily', mesoReboot: 4_000_000, crystalCount: 1 },
  { id: 'normal-hilla', name: 'Hilla', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_000_000, crystalCount: 1 },
  { id: 'easy-von-leon', name: 'Von Leon', difficulty: 'Easy', frequency: 'daily', mesoReboot: 5_290_000, crystalCount: 1 },
  { id: 'normal-von-leon', name: 'Von Leon', difficulty: 'Normal', frequency: 'daily', mesoReboot: 7_290_000, crystalCount: 1 },
  { id: 'easy-arkarium', name: 'Arkarium', difficulty: 'Easy', frequency: 'daily', mesoReboot: 5_760_000, crystalCount: 1 },
  { id: 'normal-arkarium', name: 'Arkarium', difficulty: 'Normal', frequency: 'daily', mesoReboot: 12_602_500, crystalCount: 1 },
  { id: 'easy-magnus', name: 'Magnus', difficulty: 'Easy', frequency: 'daily', mesoReboot: 3_610_000, crystalCount: 1 },
  { id: 'normal-papulatus', name: 'Papulatus', difficulty: 'Normal', frequency: 'daily', mesoReboot: 13_322_500, crystalCount: 1 },
  { id: 'normal-pierre', name: 'Pierre', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_840_000, crystalCount: 1 },
  { id: 'normal-von-bon', name: 'Von Bon', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_840_000, crystalCount: 1 },
  { id: 'normal-crimson-queen', name: 'Crimson Queen', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_840_000, crystalCount: 1 },
  { id: 'normal-vellum', name: 'Vellum', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_840_000, crystalCount: 1 },
  { id: 'normal-mori-ranmaru', name: 'Mori Ranmaru', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_202_500, crystalCount: 1 },
  { id: 'normal-omni-cln', name: 'OMNI-CLN', difficulty: 'Normal', frequency: 'daily', mesoReboot: 6_250_000, crystalCount: 1 },
  { id: 'chaos-zakum', name: 'Zakum', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 81_000_000, crystalCount: 1 },
  { id: 'hard-magnus', name: 'Magnus', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 95_062_500, crystalCount: 1 },
  { id: 'normal-akechi', name: 'Akechi', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 14_400_000, crystalCount: 1 },
  { id: 'chaos-papulatus', name: 'Papulatus', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 132_250_000, crystalCount: 1 },
  { id: 'chaos-von-bon', name: 'Von Bon', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 81_000_000, crystalCount: 1 },
  { id: 'chaos-pierre', name: 'Pierre', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 81_000_000, crystalCount: 1 },
  { id: 'chaos-crimson-queen', name: 'Crimson Queen', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 81_000_000, crystalCount: 1 },
  { id: 'chaos-vellum', name: 'Vellum', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 105_062_500, crystalCount: 1 },
  { id: 'easy-empress', name: 'Empress (Cygnus)', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 45_562_500, crystalCount: 1 },
  { id: 'normal-empress', name: 'Empress (Cygnus)', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 72_250_000, crystalCount: 1 },
  { id: 'hard-hilla', name: 'Hilla', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 56_250_000, crystalCount: 1 },
  { id: 'chaos-pink-bean', name: 'Pink Bean', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 64_000_000, crystalCount: 1 },
  { id: 'princess-no', name: 'Princess No', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 81_000_000, crystalCount: 1 },
  { id: 'hard-mori-ranmaru', name: 'Mori Ranmaru', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 13_322_500, crystalCount: 1 },
  { id: 'normal-lotus', name: 'Lotus', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 162_562_500, crystalCount: 1 },
  { id: 'hard-lotus', name: 'Lotus', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 444_675_000, crystalCount: 1 },
  { id: 'extreme-lotus', name: 'Lotus', difficulty: 'Extreme', frequency: 'weekly', mesoReboot: 1_397_500_000, crystalCount: 1 },
  { id: 'normal-damien', name: 'Damien', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 169_000_000, crystalCount: 1 },
  { id: 'hard-damien', name: 'Damien', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 421_875_000, crystalCount: 1 },
  { id: 'normal-guardian-angel-slime', name: 'Guardian Angel Slime', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 231_673_500, crystalCount: 1 },
  { id: 'chaos-guardian-angel-slime', name: 'Guardian Angel Slime', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 600_578_125, crystalCount: 1 },
  { id: 'easy-lucid', name: 'Lucid', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 237_009_375, crystalCount: 1 },
  { id: 'normal-lucid', name: 'Lucid', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 253_828_125, crystalCount: 1 },
  { id: 'hard-lucid', name: 'Lucid', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 504_000_000, crystalCount: 1 },
  { id: 'easy-will', name: 'Will', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 246_744_750, crystalCount: 1 },
  { id: 'normal-will', name: 'Will', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 279_075_000, crystalCount: 1 },
  { id: 'hard-will', name: 'Will', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 621_810_000, crystalCount: 1 },
  { id: 'normal-gloom', name: 'Gloom', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 297_675_000, crystalCount: 1 },
  { id: 'chaos-gloom', name: 'Gloom', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 563_945_000, crystalCount: 1 },
  { id: 'normal-verus-hilla', name: 'Verus Hilla', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 581_880_000, crystalCount: 1 },
  { id: 'hard-verus-hilla', name: 'Verus Hilla', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 762_105_000, crystalCount: 1 },
  { id: 'normal-darknell', name: 'Darknell', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 316_875_000, crystalCount: 1 },
  { id: 'hard-darknell', name: 'Darknell', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 667_920_000, crystalCount: 1 },
  { id: 'normal-chosen-seren', name: 'Chosen Seren', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 889_021_875, crystalCount: 1 },
  { id: 'hard-chosen-seren', name: 'Chosen Seren', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 1_096_562_500, crystalCount: 1 },
  { id: 'extreme-chosen-seren', name: 'Chosen Seren', difficulty: 'Extreme', frequency: 'weekly', mesoReboot: 4_235_000_000, crystalCount: 1 },
  { id: 'easy-kalos', name: 'Kalos', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 937_500_000, crystalCount: 1 },
  { id: 'normal-kalos', name: 'Kalos', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 1_300_000_000, crystalCount: 1 },
  { id: 'chaos-kalos', name: 'Kalos', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 2_600_000_000, crystalCount: 1 },
  { id: 'extreme-kalos', name: 'Kalos', difficulty: 'Extreme', frequency: 'weekly', mesoReboot: 5_200_000_000, crystalCount: 1 },
  { id: 'easy-first-adversary', name: 'First Adversary', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 985_000_000, crystalCount: 1 },
  { id: 'normal-first-adversary', name: 'First Adversary', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 1_365_000_000, crystalCount: 1 },
  { id: 'hard-first-adversary', name: 'First Adversary', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 2_940_000_000, crystalCount: 1 },
  { id: 'extreme-first-adversary', name: 'First Adversary', difficulty: 'Extreme', frequency: 'weekly', mesoReboot: 5_880_000_000, crystalCount: 1 },
  { id: 'easy-kaling', name: 'Kaling', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 1_031_250_000, crystalCount: 1 },
  { id: 'normal-kaling', name: 'Kaling', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 1_506_500_000, crystalCount: 1 },
  { id: 'hard-kaling', name: 'Kaling', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 2_990_000_000, crystalCount: 1 },
  { id: 'extreme-kaling', name: 'Kaling', difficulty: 'Extreme', frequency: 'weekly', mesoReboot: 6_026_000_000, crystalCount: 1 },
  { id: 'normal-limbo', name: 'Limbo', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 2_100_000_000, crystalCount: 1 },
  { id: 'hard-limbo', name: 'Limbo', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 3_745_000_000, crystalCount: 1 },
  { id: 'normal-baldrix', name: 'Baldrix', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 2_800_000_000, crystalCount: 1 },
  { id: 'hard-baldrix', name: 'Baldrix', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 4_200_000_000, crystalCount: 1 },
  { id: 'hard-black-mage', name: 'Black Mage', difficulty: 'Hard', frequency: 'monthly', mesoReboot: 4_500_000_000, crystalCount: 1 },
  { id: 'extreme-black-mage', name: 'Black Mage', difficulty: 'Extreme', frequency: 'monthly', mesoReboot: 18_000_000_000, crystalCount: 1 },
]);

export const DEFAULT_BOSS_DATA: BossData = {
  crystalsPerCharacterCap: CRYSTALS_PER_CHARACTER_CAP,
  crystalsAccountCap: CRYSTALS_ACCOUNT_CAP,
  bosses: DEFAULT_BOSSES,
};

export function loadBosses(): Boss[] {
  if (typeof localStorage === 'undefined') return DEFAULT_BOSSES;

  try {
    const stored = localStorage.getItem(BOSS_STORAGE_KEY);
    if (!stored) return DEFAULT_BOSSES;
    const overrides = JSON.parse(stored) as Boss[];
    const overrideById = new Map(overrides.map((boss) => [boss.id, boss]));
    const mergedDefaults = DEFAULT_BOSSES.map((boss) => ({ ...boss, ...overrideById.get(boss.id) }));
    const extraOverrides = overrides.filter((boss) => !DEFAULT_BOSSES.some((defaultBoss) => defaultBoss.id === boss.id));
    return [...mergedDefaults, ...extraOverrides];
  } catch {
    return DEFAULT_BOSSES;
  }
}
