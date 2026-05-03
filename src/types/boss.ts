export type BossDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Chaos' | 'Extreme';
export type BossFrequency = 'daily' | 'weekly' | 'monthly';

export interface Boss {
  id: string;
  name: string;
  difficulty: BossDifficulty;
  frequency: BossFrequency;
  mesoReboot: number;
  crystalCount: number;
}

export interface BossData {
  crystalsPerCharacterCap: number;
  crystalsAccountCap: number;
  bosses: Boss[];
}

export interface CharacterBossState {
  id: string;
  name: string;
  selectedBossIds: string[];
  partySize: number;
}

export interface AccountBossState {
  characters: CharacterBossState[];
}
