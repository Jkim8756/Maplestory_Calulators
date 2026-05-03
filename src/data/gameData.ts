import { DEFAULT_BOSS_DATA } from './bosses';
import { DEFAULT_EXP_DATA } from './expTable';
import { DEFAULT_LIBERATION_DATA } from './liberation';
import { DEFAULT_SYMBOL_DATA } from './symbols';
import type { Boss, BossData } from '../types/boss';
import type { ExpBuff, ExpData, ExpSource } from '../types/exp';
import type { GameDataBundle, GameDataOverride, GameDataValidationResult } from '../types/gameData';
import type { LiberationData, LiberationStage } from '../types/liberation';
import type { SymbolArea, SymbolData } from '../types/symbol';

export const GAME_DATA_STORAGE_KEY = 'ms_calc_game_data_override';

export const DEFAULT_GAME_DATA: GameDataBundle = {
  schemaVersion: 1,
  dataVersion: '2026-05-02-gms-heroic-defaults',
  generatedAt: '2026-05-02',
  notes: [
    'Defaults follow PLAN.md for GMS Reboot/Heroic.',
    'EXP source values marked manual default to 0 and are intended for local overrides.',
  ],
  bosses: DEFAULT_BOSS_DATA,
  exp: DEFAULT_EXP_DATA,
  symbols: DEFAULT_SYMBOL_DATA,
  liberation: DEFAULT_LIBERATION_DATA,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function hasUniqueIds(items: Array<{ id: string }>): boolean {
  return new Set(items.map((item) => item.id)).size === items.length;
}

function validateBossData(data: BossData, errors: string[]): void {
  if (!Number.isInteger(data.crystalsPerCharacterCap) || data.crystalsPerCharacterCap <= 0) {
    errors.push('bosses.crystalsPerCharacterCap must be a positive integer.');
  }
  if (!Number.isInteger(data.crystalsAccountCap) || data.crystalsAccountCap <= 0) {
    errors.push('bosses.crystalsAccountCap must be a positive integer.');
  }
  if (!Array.isArray(data.bosses) || data.bosses.length === 0) {
    errors.push('bosses.bosses must contain at least one boss.');
    return;
  }
  if (!hasUniqueIds(data.bosses)) errors.push('bosses.bosses ids must be unique.');

  data.bosses.forEach((boss: Boss, index) => {
    if (!isString(boss.id)) errors.push(`bosses.bosses[${index}].id is required.`);
    if (!isString(boss.name)) errors.push(`bosses.bosses[${index}].name is required.`);
    if (!['Easy', 'Normal', 'Hard', 'Chaos', 'Extreme'].includes(boss.difficulty)) {
      errors.push(`bosses.bosses[${index}].difficulty is invalid.`);
    }
    if (!['daily', 'weekly', 'monthly'].includes(boss.frequency)) {
      errors.push(`bosses.bosses[${index}].frequency is invalid.`);
    }
    if (!isNonNegativeNumber(boss.mesoReboot)) errors.push(`bosses.bosses[${index}].mesoReboot must be non-negative.`);
    if (!Number.isInteger(boss.crystalCount) || boss.crystalCount <= 0) {
      errors.push(`bosses.bosses[${index}].crystalCount must be a positive integer.`);
    }
  });
}

function validateExpData(data: ExpData, errors: string[]): void {
  if (!Number.isInteger(data.minLevel) || data.minLevel < 1) errors.push('exp.minLevel must be at least 1.');
  if (!Number.isInteger(data.maxLevel) || data.maxLevel <= data.minLevel) {
    errors.push('exp.maxLevel must be greater than exp.minLevel.');
  }
  if (!Array.isArray(data.expTable) || data.expTable.length <= data.maxLevel) {
    errors.push('exp.expTable must include indexes through exp.maxLevel.');
  }
  data.expTable.forEach((exp, level) => {
    if (!isNonNegativeNumber(exp)) errors.push(`exp.expTable[${level}] must be non-negative.`);
  });
  if (!Array.isArray(data.buffs) || !hasUniqueIds(data.buffs)) errors.push('exp.buffs ids must be unique.');
  data.buffs.forEach((buff: ExpBuff, index) => {
    if (!isString(buff.id)) errors.push(`exp.buffs[${index}].id is required.`);
    if (!isString(buff.label)) errors.push(`exp.buffs[${index}].label is required.`);
    if (!isPositiveNumber(buff.multiplier)) errors.push(`exp.buffs[${index}].multiplier must be positive.`);
  });
  if (!Array.isArray(data.sources) || !hasUniqueIds(data.sources)) errors.push('exp.sources ids must be unique.');
  data.sources.forEach((source: ExpSource, index) => {
    if (!isString(source.id)) errors.push(`exp.sources[${index}].id is required.`);
    if (!isString(source.label)) errors.push(`exp.sources[${index}].label is required.`);
    if (!isNonNegativeNumber(source.defaultExp)) errors.push(`exp.sources[${index}].defaultExp must be non-negative.`);
  });
}

function validateSymbolData(data: SymbolData, errors: string[]): void {
  if (!Array.isArray(data.arcaneCost) || data.arcaneCost.length !== 19) {
    errors.push('symbols.arcaneCost must contain 19 entries for levels 1 through 19.');
  }
  if (!Array.isArray(data.sacredCost) || data.sacredCost.length !== 10) {
    errors.push('symbols.sacredCost must contain 10 entries for levels 1 through 10.');
  }
  [...data.arcaneCost, ...data.sacredCost].forEach((cost, index) => {
    if (!isNonNegativeNumber(cost)) errors.push(`symbols cost entry ${index} must be non-negative.`);
  });

  const areas = [...data.arcaneAreas, ...data.sacredAreas];
  if (!hasUniqueIds(areas)) errors.push('symbols area ids must be unique.');
  areas.forEach((area: SymbolArea, index) => {
    if (!isString(area.id)) errors.push(`symbols area ${index}.id is required.`);
    if (!isString(area.name)) errors.push(`symbols area ${index}.name is required.`);
    if (!['arcane', 'sacred'].includes(area.type)) errors.push(`symbols area ${index}.type is invalid.`);
    if (!Number.isInteger(area.maxSymbolLevel) || area.maxSymbolLevel <= 1) {
      errors.push(`symbols area ${index}.maxSymbolLevel must be greater than 1.`);
    }
    if (!isNonNegativeNumber(area.dailyQuestSymbols)) errors.push(`symbols area ${index}.dailyQuestSymbols must be non-negative.`);
    if (!isNonNegativeNumber(area.weeklyDungeonSymbols)) errors.push(`symbols area ${index}.weeklyDungeonSymbols must be non-negative.`);
  });
}

function validateLiberationData(data: LiberationData, errors: string[]): void {
  if (!isPositiveNumber(data.maxTracesPerKill)) errors.push('liberation.maxTracesPerKill must be positive.');
  if (!Array.isArray(data.stages) || data.stages.length !== 8) errors.push('liberation.stages must contain 8 stages.');
  data.stages.forEach((stage: LiberationStage, index) => {
    if (stage.order !== index + 1) errors.push(`liberation.stages[${index}].order must be ${index + 1}.`);
    if (!isString(stage.bossName)) errors.push(`liberation.stages[${index}].bossName is required.`);
    if (!isString(stage.bossMode)) errors.push(`liberation.stages[${index}].bossMode is required.`);
    if (!isPositiveNumber(stage.tracesRequired)) errors.push(`liberation.stages[${index}].tracesRequired must be positive.`);
    if (!isNonNegativeNumber(stage.finalDamageReduction) || stage.finalDamageReduction > 100) {
      errors.push(`liberation.stages[${index}].finalDamageReduction must be between 0 and 100.`);
    }
  });
}

export function mergeGameDataOverride(
  defaults: GameDataBundle,
  override?: GameDataOverride | null,
): GameDataBundle {
  if (!override || !isObject(override)) return defaults;

  return {
    ...defaults,
    dataVersion: override.dataVersion ?? defaults.dataVersion,
    notes: override.notes ?? defaults.notes,
    bosses: { ...defaults.bosses, ...override.bosses },
    exp: { ...defaults.exp, ...override.exp },
    symbols: { ...defaults.symbols, ...override.symbols },
    liberation: { ...defaults.liberation, ...override.liberation },
  };
}

export function validateGameDataBundle(bundle: GameDataBundle): GameDataValidationResult {
  const errors: string[] = [];

  if (bundle.schemaVersion !== 1) errors.push('schemaVersion must be 1.');
  if (!isString(bundle.dataVersion)) errors.push('dataVersion is required.');
  validateBossData(bundle.bosses, errors);
  validateExpData(bundle.exp, errors);
  validateSymbolData(bundle.symbols, errors);
  validateLiberationData(bundle.liberation, errors);

  return { ok: errors.length === 0, errors };
}

export function parseGameDataOverride(rawJson: string): GameDataOverride {
  const parsed = JSON.parse(rawJson) as unknown;
  if (!isObject(parsed)) throw new Error('Game data override must be a JSON object.');
  return parsed as GameDataOverride;
}

export function loadGameDataBundle(): GameDataBundle {
  if (typeof localStorage === 'undefined') return DEFAULT_GAME_DATA;

  try {
    const stored = localStorage.getItem(GAME_DATA_STORAGE_KEY);
    const override = stored ? parseGameDataOverride(stored) : null;
    const merged = mergeGameDataOverride(DEFAULT_GAME_DATA, override);
    return validateGameDataBundle(merged).ok ? merged : DEFAULT_GAME_DATA;
  } catch {
    return DEFAULT_GAME_DATA;
  }
}

export function saveGameDataOverride(override: GameDataOverride): GameDataValidationResult {
  const merged = mergeGameDataOverride(DEFAULT_GAME_DATA, override);
  const validation = validateGameDataBundle(merged);
  if (!validation.ok || typeof localStorage === 'undefined') return validation;

  localStorage.setItem(GAME_DATA_STORAGE_KEY, JSON.stringify(override));
  return validation;
}

export function resetGameDataOverride(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(GAME_DATA_STORAGE_KEY);
}
