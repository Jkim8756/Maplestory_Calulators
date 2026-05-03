import type { SymbolArea, SymbolData } from '../types/symbol';

export const SYMBOL_STORAGE_KEY = 'ms_calc_symbols_override';

export const ARCANE_COST: number[] = [
  12, 15, 20, 27, 36, 47, 60, 75, 92, 111,
  132, 155, 180, 207, 236, 267, 300, 335, 372,
];

export const SACRED_COST: number[] = [
  29, 76, 141, 224, 325, 444, 581, 736, 909, 1100,
];

export const DEFAULT_ARCANE_AREAS: SymbolArea[] = [
  { id: 'vanishing-journey', name: 'Vanishing Journey', type: 'arcane', minLevel: 200, maxSymbolLevel: 20, dailyQuestSymbols: 20, weeklyDungeonSymbols: 45, weeklyDungeonMaxClears: 3, released: true },
  { id: 'chu-chu-island', name: 'Chu Chu Island', type: 'arcane', minLevel: 210, maxSymbolLevel: 20, dailyQuestSymbols: 20, weeklyDungeonSymbols: 45, weeklyDungeonMaxClears: 3, released: true },
  { id: 'lachelein', name: 'Lachelein', type: 'arcane', minLevel: 220, maxSymbolLevel: 20, dailyQuestSymbols: 40, weeklyDungeonSymbols: 45, weeklyDungeonMaxClears: 3, released: true },
  { id: 'arcana', name: 'Arcana', type: 'arcane', minLevel: 225, maxSymbolLevel: 20, dailyQuestSymbols: 40, weeklyDungeonSymbols: 45, weeklyDungeonMaxClears: 3, released: true },
  { id: 'morass', name: 'Morass', type: 'arcane', minLevel: 230, maxSymbolLevel: 20, dailyQuestSymbols: 40, weeklyDungeonSymbols: 45, weeklyDungeonMaxClears: 3, released: true },
  { id: 'esfera', name: 'Esfera', type: 'arcane', minLevel: 235, maxSymbolLevel: 20, dailyQuestSymbols: 40, weeklyDungeonSymbols: 45, weeklyDungeonMaxClears: 3, released: true },
];

export const DEFAULT_SACRED_AREAS: SymbolArea[] = [
  { id: 'cernium', name: 'Cernium', type: 'sacred', minLevel: 260, maxSymbolLevel: 11, dailyQuestSymbols: 20, weeklyDungeonSymbols: 0, weeklyDungeonMaxClears: 0, released: true },
  { id: 'hotel-arcs', name: 'Hotel Arcs', type: 'sacred', minLevel: 265, maxSymbolLevel: 11, dailyQuestSymbols: 10, weeklyDungeonSymbols: 0, weeklyDungeonMaxClears: 0, released: true },
  { id: 'odium', name: 'Odium', type: 'sacred', minLevel: 270, maxSymbolLevel: 11, dailyQuestSymbols: 10, weeklyDungeonSymbols: 0, weeklyDungeonMaxClears: 0, released: true },
  { id: 'shangri-la', name: 'Shangri-La', type: 'sacred', minLevel: 275, maxSymbolLevel: 11, dailyQuestSymbols: 10, weeklyDungeonSymbols: 0, weeklyDungeonMaxClears: 0, released: true },
  { id: 'arteria', name: 'Arteria', type: 'sacred', minLevel: 280, maxSymbolLevel: 11, dailyQuestSymbols: 10, weeklyDungeonSymbols: 0, weeklyDungeonMaxClears: 0, released: true },
  { id: 'carcion', name: 'Carcion', type: 'sacred', minLevel: 285, maxSymbolLevel: 11, dailyQuestSymbols: 10, weeklyDungeonSymbols: 0, weeklyDungeonMaxClears: 0, released: true },
  { id: 'tallahart', name: 'Tallahart', type: 'sacred', minLevel: 290, maxSymbolLevel: 11, dailyQuestSymbols: 10, weeklyDungeonSymbols: 0, weeklyDungeonMaxClears: 0, released: false },
];

export const DEFAULT_SYMBOL_DATA: SymbolData = {
  arcaneCost: ARCANE_COST,
  sacredCost: SACRED_COST,
  arcaneAreas: DEFAULT_ARCANE_AREAS,
  sacredAreas: DEFAULT_SACRED_AREAS,
};

export function loadSymbolAreas(): { arcane: SymbolArea[]; sacred: SymbolArea[] } {
  if (typeof localStorage === 'undefined') {
    return { arcane: DEFAULT_ARCANE_AREAS, sacred: DEFAULT_SACRED_AREAS };
  }

  try {
    const stored = localStorage.getItem(SYMBOL_STORAGE_KEY);
    return stored
      ? (JSON.parse(stored) as { arcane: SymbolArea[]; sacred: SymbolArea[] })
      : { arcane: DEFAULT_ARCANE_AREAS, sacred: DEFAULT_SACRED_AREAS };
  } catch {
    return { arcane: DEFAULT_ARCANE_AREAS, sacred: DEFAULT_SACRED_AREAS };
  }
}
