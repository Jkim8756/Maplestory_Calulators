import type { Boss, CharacterBossState } from '../types/boss'

export const CRYSTALS_PER_CHARACTER_CAP = 14
export const CRYSTALS_ACCOUNT_CAP = 180

export interface BossIncomeLine {
  bossId: string
  bossName: string
  difficulty: Boss['difficulty']
  frequency: Boss['frequency']
  rawMeso: number
  partySize: number
  weeklyClearCount: number
  countsTowardCharacterCap: boolean
  crystalCount: number
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

function partySizeForBoss(state: CharacterBossState, bossId: string): number {
  return normalizePartySize(state.partySizeByBossId?.[bossId] ?? state.partySize)
}

function partyLimitForBoss(boss: Boss): number {
  const fallbackLimit = boss.name === 'First Adversary' || boss.name === 'Limbo' || boss.name === 'Baldrix' ? 3 : 6
  return Math.max(1, Math.floor(boss.partyLimit ?? fallbackLimit))
}

function weeklyClearCountForBoss(state: CharacterBossState, boss: Boss): number {
  if (boss.frequency !== 'daily') return 1
  const value = state.dailyClearCountByBossId?.[boss.id] ?? 7
  return Math.max(0, Math.min(7, Math.floor(Number.isFinite(value) ? value : 7)))
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
  const selected = allBosses.filter(b => selectedBossIds.has(b.id))
  const bosses = selected.map((boss): BossIncomeLine => {
    const partySize = partySizeForBoss(state, boss.id)
    const cappedPartySize = Math.min(partySize, partyLimitForBoss(boss))
    const weeklyClearCount = weeklyClearCountForBoss(state, boss)
    const contributesToTotals = boss.frequency !== 'monthly'
    const crystalCount = contributesToTotals ? weeklyClearCount * (boss.crystalCount || 1) : 0
    return {
      bossId: boss.id,
      bossName: boss.name,
      difficulty: boss.difficulty,
      frequency: boss.frequency,
      rawMeso: boss.mesoReboot,
      partySize: cappedPartySize,
      weeklyClearCount,
      countsTowardCharacterCap: boss.frequency === 'weekly',
      crystalCount,
      splitMeso: contributesToTotals ? Math.floor(boss.mesoReboot / cappedPartySize) * weeklyClearCount : 0,
    }
  })
  const weeklyMeso = bosses.reduce((sum, boss) => sum + boss.splitMeso, 0)
  const crystalsUsed = bosses
    .filter((boss) => boss.countsTowardCharacterCap)
    .reduce((sum, boss) => sum + boss.crystalCount, 0)

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
  const accountCrystalsUsed = characterResults.reduce(
    (sum, r) => sum + r.bosses.reduce((bossSum, boss) => bossSum + boss.crystalCount, 0),
    0
  )
  const accountTotalMeso = characterResults.reduce((sum, r) => sum + r.weeklyMeso, 0)
  return {
    characters: characterResults,
    accountTotalMeso,
    accountCrystalsUsed,
    isOverAccountCap: accountCrystalsUsed > CRYSTALS_ACCOUNT_CAP,
    remainingAccountCrystals: Math.max(0, CRYSTALS_ACCOUNT_CAP - accountCrystalsUsed),
  }
}
