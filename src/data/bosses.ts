import type { Boss, BossData } from '../types/boss';

export const BOSS_STORAGE_KEY = 'ms_calc_bosses_override';
export const CRYSTALS_PER_CHARACTER_CAP = 14;
export const CRYSTALS_ACCOUNT_CAP = 180;

export const DEFAULT_BOSSES: Boss[] = [
  { id: 'easy-zakum', name: 'Zakum', difficulty: 'Easy', frequency: 'daily', mesoReboot: 1_000_000, crystalCount: 1 },
  { id: 'normal-zakum', name: 'Zakum', difficulty: 'Normal', frequency: 'daily', mesoReboot: 3_062_500, crystalCount: 1 },
  { id: 'easy-horntail', name: 'Horntail', difficulty: 'Easy', frequency: 'daily', mesoReboot: 4_410_000, crystalCount: 1 },
  { id: 'normal-horntail', name: 'Horntail', difficulty: 'Normal', frequency: 'daily', mesoReboot: 5_062_500, crystalCount: 1 },
  { id: 'chaos-horntail', name: 'Horntail', difficulty: 'Chaos', frequency: 'daily', mesoReboot: 6_760_000, crystalCount: 1 },
  { id: 'normal-pink-bean', name: 'Pink Bean', difficulty: 'Normal', frequency: 'daily', mesoReboot: 7_022_000, crystalCount: 1 },
  { id: 'easy-hilla', name: 'Hilla', difficulty: 'Easy', frequency: 'daily', mesoReboot: 4_000_000, crystalCount: 1 },
  { id: 'normal-hilla', name: 'Hilla', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_000_000, crystalCount: 1 },
  { id: 'easy-von-leon', name: 'Von Leon', difficulty: 'Easy', frequency: 'daily', mesoReboot: 5_290_000, crystalCount: 1 },
  { id: 'normal-von-leon', name: 'Von Leon', difficulty: 'Normal', frequency: 'daily', mesoReboot: 7_290_000, crystalCount: 1 },
  { id: 'easy-arkarium', name: 'Arkarium', difficulty: 'Easy', frequency: 'daily', mesoReboot: 5_760_000, crystalCount: 1 },
  { id: 'normal-arkarium', name: 'Arkarium', difficulty: 'Normal', frequency: 'daily', mesoReboot: 12_600_000, crystalCount: 1 },
  { id: 'easy-magnus', name: 'Magnus', difficulty: 'Easy', frequency: 'daily', mesoReboot: 3_610_000, crystalCount: 1 },
  { id: 'normal-papulatus', name: 'Papulatus', difficulty: 'Normal', frequency: 'daily', mesoReboot: 3_422_500, crystalCount: 1 },
  { id: 'normal-pierre', name: 'Pierre', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_840_000, crystalCount: 1 },
  { id: 'normal-von-bon', name: 'Von Bon', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_840_000, crystalCount: 1 },
  { id: 'normal-crimson-queen', name: 'Crimson Queen', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_840_000, crystalCount: 1 },
  { id: 'normal-vellum', name: 'Vellum', difficulty: 'Normal', frequency: 'daily', mesoReboot: 4_840_000, crystalCount: 1 },
  { id: 'chaos-zakum', name: 'Zakum', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 12_834_800, crystalCount: 1 },
  { id: 'hard-magnus', name: 'Magnus', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 15_074_200, crystalCount: 1 },
  { id: 'chaos-papulatus', name: 'Papulatus', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 26_770_800, crystalCount: 1 },
  { id: 'chaos-von-bon', name: 'Von Bon', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 12_819_500, crystalCount: 1 },
  { id: 'chaos-pierre', name: 'Pierre', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 12_834_800, crystalCount: 1 },
  { id: 'chaos-crimson-queen', name: 'Crimson Queen', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 12_817_600, crystalCount: 1 },
  { id: 'chaos-vellum', name: 'Vellum', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 16_549_700, crystalCount: 1 },
  { id: 'easy-empress', name: 'Empress (Cygnus)', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 45_560_000, crystalCount: 1 },
  { id: 'normal-lotus', name: 'Lotus', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 57_902_900, crystalCount: 1 },
  { id: 'hard-lotus', name: 'Lotus', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 115_805_800, crystalCount: 1 },
  { id: 'normal-damien', name: 'Damien', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 55_044_200, crystalCount: 1 },
  { id: 'hard-damien', name: 'Damien', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 110_088_400, crystalCount: 1 },
  { id: 'easy-lucid', name: 'Lucid', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 40_000_000, crystalCount: 1 },
  { id: 'normal-lucid', name: 'Lucid', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 80_000_000, crystalCount: 1 },
  { id: 'hard-lucid', name: 'Lucid', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 127_197_800, crystalCount: 1 },
  { id: 'easy-will', name: 'Will', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 35_000_000, crystalCount: 1 },
  { id: 'normal-will', name: 'Will', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 70_000_000, crystalCount: 1 },
  { id: 'hard-will', name: 'Will', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 140_594_200, crystalCount: 1 },
  { id: 'normal-gloom', name: 'Gloom', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 75_788_100, crystalCount: 1 },
  { id: 'chaos-gloom', name: 'Gloom', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 151_576_200, crystalCount: 1 },
  { id: 'normal-verus-hilla', name: 'Verus Hilla', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 90_000_000, crystalCount: 1 },
  { id: 'hard-verus-hilla', name: 'Verus Hilla', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 180_241_400, crystalCount: 1 },
  { id: 'normal-darknell', name: 'Darknell', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 60_000_000, crystalCount: 1 },
  { id: 'hard-darknell', name: 'Darknell', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 120_000_000, crystalCount: 1 },
  { id: 'normal-chosen-seren', name: 'Chosen Seren', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 1_512_500_000, crystalCount: 1 },
  { id: 'hard-chosen-seren', name: 'Chosen Seren', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 3_025_000_000, crystalCount: 1 },
  { id: 'normal-kalos', name: 'Kalos', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 1_000_000_000, crystalCount: 1 },
  { id: 'chaos-kalos', name: 'Kalos', difficulty: 'Chaos', frequency: 'weekly', mesoReboot: 2_000_000_000, crystalCount: 1 },
  { id: 'extreme-kalos', name: 'Kalos', difficulty: 'Extreme', frequency: 'weekly', mesoReboot: 4_000_000_000, crystalCount: 1 },
  { id: 'easy-kaling', name: 'Kaling', difficulty: 'Easy', frequency: 'weekly', mesoReboot: 500_000_000, crystalCount: 1 },
  { id: 'normal-kaling', name: 'Kaling', difficulty: 'Normal', frequency: 'weekly', mesoReboot: 1_000_000_000, crystalCount: 1 },
  { id: 'hard-kaling', name: 'Kaling', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 2_000_000_000, crystalCount: 1 },
  { id: 'extreme-kaling', name: 'Kaling', difficulty: 'Extreme', frequency: 'weekly', mesoReboot: 4_600_000_000, crystalCount: 1 },
  { id: 'hard-black-mage', name: 'Black Mage', difficulty: 'Hard', frequency: 'monthly', mesoReboot: 10_000_000_000, crystalCount: 1 },
];

export const DEFAULT_BOSS_DATA: BossData = {
  crystalsPerCharacterCap: CRYSTALS_PER_CHARACTER_CAP,
  crystalsAccountCap: CRYSTALS_ACCOUNT_CAP,
  bosses: DEFAULT_BOSSES,
};

export function loadBosses(): Boss[] {
  if (typeof localStorage === 'undefined') return DEFAULT_BOSSES;

  try {
    const stored = localStorage.getItem(BOSS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Boss[]) : DEFAULT_BOSSES;
  } catch {
    return DEFAULT_BOSSES;
  }
}
