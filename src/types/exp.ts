export type ExpBuffCategory = 'coupon' | 'sauna' | 'booster' | 'training' | 'event' | 'other';
export type BuffCategory = ExpBuffCategory;

export interface ExpBuff {
  id: string;
  label: string;
  description: string;
  multiplier: number;
  category: ExpBuffCategory;
  exclusiveGroup?: string;
  exclusive?: string;
}

export interface ExpSource {
  id: string;
  label: string;
  description: string;
  defaultExp: number;
  repeatable: boolean;
}

export interface ExpData {
  minLevel: number;
  maxLevel: number;
  expTable: number[];
  buffs: ExpBuff[];
  sources: ExpSource[];
}

export interface ExpCharacterState {
  id: string;
  name: string;
  currentLevel: number;
  currentExpPct: number;
  baseExpPerHour: number;
  activeBuffIds: string[];
  serverEventMultiplier: number;
}

export interface AccountExpState {
  characters: ExpCharacterState[];
}
