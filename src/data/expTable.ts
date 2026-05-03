import type { ExpBuff, ExpData, ExpSource } from '../types/exp';

export const EXP_TABLE_STORAGE_KEY = 'ms_calc_exp_table_override';
export const EXP_BUFFS_STORAGE_KEY = 'ms_calc_exp_buffs_override';

const EXP_ANCHORS: Array<[number, number]> = [
  [1, 15],
  [10, 1_242],
  [30, 35_990],
  [60, 561_990],
  [100, 12_549_990],
  [140, 454_499_990],
  [180, 9_469_599_990],
  [200, 7_854_593_165],
  [210, 22_065_700_000],
  [220, 57_480_000_000],
  [230, 144_000_000_000],
  [240, 355_000_000_000],
  [250, 872_000_000_000],
  [260, 2_120_000_000_000],
  [270, 5_100_000_000_000],
  [280, 12_200_000_000_000],
  [290, 29_000_000_000_000],
  [299, 68_000_000_000_000],
];

function buildExpTable(): number[] {
  const table = Array<number>(301).fill(0);

  for (let index = 0; index < EXP_ANCHORS.length - 1; index++) {
    const [startLevel, startExp] = EXP_ANCHORS[index];
    const [endLevel, endExp] = EXP_ANCHORS[index + 1];
    const levels = endLevel - startLevel;
    const growth = Math.pow(endExp / startExp, 1 / levels);

    for (let offset = 0; offset < levels; offset++) {
      table[startLevel + offset] = Math.round(startExp * Math.pow(growth, offset));
    }
  }

  table[299] = 68_000_000_000_000;
  table[300] = 0;
  return table;
}

export const EXP_TABLE = buildExpTable();

export const DEFAULT_EXP_BUFFS: ExpBuff[] = [
  {
    id: 'coupon-2x',
    label: '2x EXP Coupon',
    description: 'Mutually exclusive coupon slot; highest active coupon wins.',
    multiplier: 2,
    category: 'coupon',
    exclusiveGroup: 'coupon',
    exclusive: 'coupon',
  },
  {
    id: 'coupon-3x',
    label: '3x EXP Coupon',
    description: 'Mutually exclusive coupon slot; highest active coupon wins.',
    multiplier: 3,
    category: 'coupon',
    exclusiveGroup: 'coupon',
    exclusive: 'coupon',
  },
  {
    id: 'vip-sauna',
    label: 'VIP Sauna Robe',
    description: 'Default editable +10% EXP source.',
    multiplier: 1.1,
    category: 'sauna',
  },
  {
    id: 'exp-accumulation-potion',
    label: 'EXP Accumulation Potion',
    description: 'Default editable +10% EXP source.',
    multiplier: 1.1,
    category: 'booster',
  },
  {
    id: 'mvp-bonus',
    label: 'MVP Bonus',
    description: 'Default editable +10% EXP source.',
    multiplier: 1.1,
    category: 'booster',
  },
  {
    id: 'event-2x',
    label: '2x Server Event',
    description: 'Server-wide event multiplier.',
    multiplier: 2,
    category: 'event',
  },
];

export const DEFAULT_EXP_SOURCES: ExpSource[] = [
  {
    id: 'manual-flat-exp',
    label: 'Manual EXP',
    description: 'User-entered flat EXP from vouchers, events, sauna, or other sources.',
    defaultExp: 0,
    repeatable: true,
  },
  {
    id: 'vip-booster',
    label: 'VIP Booster',
    description: 'Manual observed value; no fixed public table in PLAN.md.',
    defaultExp: 0,
    repeatable: true,
  },
  {
    id: 'event-voucher',
    label: 'Event Voucher',
    description: 'Patch/event-specific EXP voucher value.',
    defaultExp: 0,
    repeatable: true,
  },
];

export const DEFAULT_EXP_DATA: ExpData = {
  minLevel: 1,
  maxLevel: 300,
  expTable: EXP_TABLE,
  buffs: DEFAULT_EXP_BUFFS,
  sources: DEFAULT_EXP_SOURCES,
};

export function loadExpTable(): number[] {
  if (typeof localStorage === 'undefined') return EXP_TABLE;

  try {
    const stored = localStorage.getItem(EXP_TABLE_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as number[]) : EXP_TABLE;
  } catch {
    return EXP_TABLE;
  }
}

export function loadExpBuffs(): ExpBuff[] {
  if (typeof localStorage === 'undefined') return DEFAULT_EXP_BUFFS;

  try {
    const stored = localStorage.getItem(EXP_BUFFS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ExpBuff[]) : DEFAULT_EXP_BUFFS;
  } catch {
    return DEFAULT_EXP_BUFFS;
  }
}
