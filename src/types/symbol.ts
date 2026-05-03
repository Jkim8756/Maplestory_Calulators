export type SymbolType = 'arcane' | 'sacred';

export interface SymbolArea {
  id: string;
  name: string;
  type: SymbolType;
  minLevel: number;
  maxSymbolLevel: number;
  dailyQuestSymbols: number;
  weeklyDungeonSymbols: number;
  weeklyDungeonMaxClears: number;
  released: boolean;
}

export interface SymbolData {
  arcaneCost: number[];
  sacredCost: number[];
  arcaneAreas: SymbolArea[];
  sacredAreas: SymbolArea[];
}

export interface SymbolProgress {
  areaId: string;
  currentLevel: number;
  currentExpSymbols: number;
  doingDailyQuest: boolean;
  weeklyClears: number;
  extraDailySymbols: number;
}

export interface CharacterSymbolState {
  id: string;
  name: string;
  progress: Record<string, SymbolProgress>;
}

export interface AccountSymbolState {
  characters: CharacterSymbolState[];
}
