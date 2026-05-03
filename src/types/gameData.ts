import type { BossData } from './boss';
import type { ExpData } from './exp';
import type { LiberationData } from './liberation';
import type { SymbolData } from './symbol';

export interface GameDataBundle {
  schemaVersion: 1;
  dataVersion: string;
  generatedAt: string;
  notes: string[];
  bosses: BossData;
  exp: ExpData;
  symbols: SymbolData;
  liberation: LiberationData;
}

export type GameDataOverride = Partial<{
  dataVersion: string;
  notes: string[];
  bosses: Partial<BossData>;
  exp: Partial<ExpData>;
  symbols: Partial<SymbolData>;
  liberation: Partial<LiberationData>;
}>;

export interface GameDataValidationResult {
  ok: boolean;
  errors: string[];
}
