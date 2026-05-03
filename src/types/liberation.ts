export interface LiberationStage {
  order: number;
  bossName: string;
  bossMode: string;
  tracesRequired: number;
  finalDamageReduction: number;
}

export type LiberationMode = 'monthly' | 'weekly';

export interface LiberationData {
  maxTracesPerKill: number;
  stages: LiberationStage[];
}

export interface CharacterLiberationState {
  id: string;
  name: string;
  currentStage: number;
  currentTraces: number;
  partySize: number;
  weeklyTracesOverride: number;
  canKillStage: Record<number, boolean>;
  mode: LiberationMode;
}

export interface AccountLiberationState {
  characters: CharacterLiberationState[];
}
