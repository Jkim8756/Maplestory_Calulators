import type { LiberationData, LiberationStage } from '../types/liberation';

export const LIBERATION_STORAGE_KEY = 'ms_calc_liberation_override';
export const MAX_TRACES_PER_KILL = 3000;

export const DEFAULT_LIBERATION_STAGES: LiberationStage[] = [
  { order: 1, bossName: 'Von Leon', bossMode: 'Hard Von Leon', tracesRequired: 500, finalDamageReduction: 90 },
  { order: 2, bossName: 'Arkarium', bossMode: 'Normal Arkarium', tracesRequired: 500, finalDamageReduction: 75 },
  { order: 3, bossName: 'Magnus', bossMode: 'Hard Magnus', tracesRequired: 600, finalDamageReduction: 60 },
  { order: 4, bossName: 'Lotus', bossMode: 'Hard Lotus', tracesRequired: 700, finalDamageReduction: 50 },
  { order: 5, bossName: 'Damien', bossMode: 'Hard Damien', tracesRequired: 800, finalDamageReduction: 40 },
  { order: 6, bossName: 'Will', bossMode: 'Hard Will', tracesRequired: 900, finalDamageReduction: 30 },
  { order: 7, bossName: 'Lucid', bossMode: 'Hard Lucid', tracesRequired: 1000, finalDamageReduction: 20 },
  { order: 8, bossName: 'Verus Hilla', bossMode: 'Hard Verus Hilla', tracesRequired: 1500, finalDamageReduction: 0 },
];

export const DEFAULT_LIBERATION_DATA: LiberationData = {
  maxTracesPerKill: MAX_TRACES_PER_KILL,
  stages: DEFAULT_LIBERATION_STAGES,
};

export function loadLiberationStages(): LiberationStage[] {
  if (typeof localStorage === 'undefined') return DEFAULT_LIBERATION_STAGES;

  try {
    const stored = localStorage.getItem(LIBERATION_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as LiberationStage[]) : DEFAULT_LIBERATION_STAGES;
  } catch {
    return DEFAULT_LIBERATION_STAGES;
  }
}
