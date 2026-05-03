import type { ExpBuff, ExpCharacterState } from '../../src/types/exp'

export interface ResolvedBuffs {
  activeBuffs: ExpBuff[]
  disabledBuffIds: Set<string>  // grayed out because a higher exclusive buff is active
  totalMultiplier: number
  breakdown: { label: string; multiplier: number }[]
}

export interface ExpSessionResult {
  totalMultiplier: number
  expGained30min: number
  pctOfLevel30min: number
  breakdown: { label: string; value: string }[]
}

export interface ExpProgressResult {
  newExpPct: number
  levelsGained: number
  newLevel: number
  newLevelPct: number
  remainingExpInLevel: number
}

function finiteNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function expRequiredForLevel(expTable: number[], level: number): number {
  return Math.max(0, finiteNumber(expTable[level], 0))
}

export function resolveBuffs(
  allBuffs: ExpBuff[],
  activeBuffIds: string[]
): ResolvedBuffs {
  const activeIds = new Set(activeBuffIds)
  const active = allBuffs.filter(b => activeIds.has(b.id))
  const disabledBuffIds = new Set<string>()

  // For exclusive groups: only keep the highest multiplier
  const exclusiveGroups = new Map<string, ExpBuff>()
  for (const buff of active) {
    if (buff.exclusive) {
      const current = exclusiveGroups.get(buff.exclusive)
      if (!current || buff.multiplier > current.multiplier) {
        if (current) disabledBuffIds.add(current.id)
        exclusiveGroups.set(buff.exclusive, buff)
      } else {
        disabledBuffIds.add(buff.id)
      }
    }
  }

  const effectiveBuffs = active.filter(b => !disabledBuffIds.has(b.id))
  const totalMultiplier = effectiveBuffs.reduce(
    (product, buff) => product * Math.max(0, finiteNumber(buff.multiplier, 1)),
    1
  )

  const breakdown = effectiveBuffs.map(b => ({ label: b.label, multiplier: b.multiplier }))

  return { activeBuffs: effectiveBuffs, disabledBuffIds, totalMultiplier, breakdown }
}

export function calcExpSession(
  state: ExpCharacterState,
  allBuffs: ExpBuff[],
  expTable: number[]
): ExpSessionResult {
  const { totalMultiplier, breakdown } = resolveBuffs(allBuffs, state.activeBuffIds)
  const eventMult = Math.max(0, finiteNumber(state.serverEventMultiplier, 1) || 1)
  const finalMult = totalMultiplier * eventMult
  const expGained30min = Math.max(0, finiteNumber(state.baseExpPerHour, 0)) * finalMult * 0.5
  const levelExp = expRequiredForLevel(expTable, state.currentLevel)
  const pctOfLevel30min = levelExp > 0 ? (expGained30min / levelExp) * 100 : 0

  return {
    totalMultiplier: finalMult,
    expGained30min,
    pctOfLevel30min,
    breakdown: [
      ...breakdown.map(b => ({
        label: b.label,
        value: `${b.multiplier.toFixed(1)}×`,
      })),
      ...(eventMult > 1 ? [{ label: 'Server Event', value: `${eventMult.toFixed(1)}×` }] : []),
    ],
  }
}

export function calcExpProgress(
  currentLevel: number,
  currentExpPct: number,
  flatExpGain: number,
  expTable: number[]
): ExpProgressResult {
  let level = Math.floor(clamp(finiteNumber(currentLevel, 1), 1, expTable.length - 1))
  let levelExp = expRequiredForLevel(expTable, level)
  let remaining = (clamp(finiteNumber(currentExpPct, 0), 0, 99.9999) / 100) * levelExp
  remaining += Math.max(0, finiteNumber(flatExpGain, 0))
  let levelsGained = 0

  while (level < expTable.length - 1) {
    levelExp = expRequiredForLevel(expTable, level)
    if (levelExp <= 0 || remaining < levelExp) break
    remaining -= levelExp
    level++
    levelsGained++
  }

  const newLevelExp = expRequiredForLevel(expTable, level)
  const newLevelPct = newLevelExp > 0 ? (remaining / newLevelExp) * 100 : 0

  return {
    newExpPct: newLevelPct,
    levelsGained,
    newLevel: level,
    newLevelPct,
    remainingExpInLevel: remaining,
  }
}
