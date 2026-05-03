import type { Boss, CharacterBossState } from '../../src/types/boss'

export const CRYSTALS_PER_CHARACTER_CAP = 14
export const CRYSTALS_ACCOUNT_CAP = 180

export interface BossIncomeLine {
  bossId: string
  bossName: string
  difficulty: Boss['difficulty']
  frequency: Boss['frequency']
  rawMeso: number
  partySize: number
  splitMeso: number
}

export interface CharacterBossResult {
  characterId: string
  characterName: string
  weeklyMeso: number
  crystalsUsed: number
  isOverCharacterCap: boolean
  remainingCharacterCrystals: number
  bosses: BossIncomeLine[]
}

export interface AccountBossResult {
  characters: CharacterBossResult[]
  accountTotalMeso: number
  accountCrystalsUsed: number
  isOverAccountCap: boolean
  remainingAccountCrystals: number
}

function normalizePartySize(partySize: number): number {
  return Math.max(1, Math.floor(Number.isFinite(partySize) ? partySize : 1))
}

function selectedBossIdSet(selectedBossIds: CharacterBossState['selectedBossIds']): Set<string> {
  const ids = selectedBossIds as unknown
  if (ids instanceof Set) return new Set(Array.from(ids, String))
  return new Set(Array.isArray(ids) ? ids.map(String) : [])
}

export function calcCharacterIncome(
  state: CharacterBossState,
  allBosses: Boss[]
): CharacterBossResult {
  const selectedBossIds = selectedBossIdSet(state.selectedBossIds)
  const partySize = normalizePartySize(state.partySize)
  const selected = allBosses.filter(b => selectedBossIds.has(b.id))
  const crystalsUsed = selected.length
  const bosses = selected.map((boss): BossIncomeLine => ({
    bossId: boss.id,
    bossName: boss.name,
    difficulty: boss.difficulty,
    frequency: boss.frequency,
    rawMeso: boss.mesoReboot,
    partySize,
    splitMeso: Math.floor(boss.mesoReboot / partySize),
  }))
  const weeklyMeso = bosses.reduce((sum, boss) => sum + boss.splitMeso, 0)

  return {
    characterId: state.id,
    characterName: state.name,
    weeklyMeso,
    crystalsUsed,
    isOverCharacterCap: crystalsUsed > CRYSTALS_PER_CHARACTER_CAP,
    remainingCharacterCrystals: Math.max(0, CRYSTALS_PER_CHARACTER_CAP - crystalsUsed),
    bosses,
  }
}

export function calcAccountSummary(
  characters: CharacterBossState[],
  allBosses: Boss[]
): AccountBossResult {
  const characterResults = characters.map(c => calcCharacterIncome(c, allBosses))
  const accountCrystalsUsed = characterResults.reduce((sum, r) => sum + r.crystalsUsed, 0)
  const accountTotalMeso = characterResults.reduce((sum, r) => sum + r.weeklyMeso, 0)
  return {
    characters: characterResults,
    accountTotalMeso,
    accountCrystalsUsed,
    isOverAccountCap: accountCrystalsUsed > CRYSTALS_ACCOUNT_CAP,
    remainingAccountCrystals: Math.max(0, CRYSTALS_ACCOUNT_CAP - accountCrystalsUsed),
  }
}
