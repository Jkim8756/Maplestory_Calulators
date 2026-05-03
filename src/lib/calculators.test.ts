import { describe, expect, it } from 'vitest'
import { calcAccountSummary, calcCharacterIncome } from './bossCalc'
import { calcExpProgress, calcExpSession } from './expCalc'
import { calcLiberationResult } from './liberationCalc'
import { effectiveDailySymbols, symbolsToMax } from './symbolCalc'
import type { Boss } from '../types/boss'
import type { ExpBuff } from '../types/exp'
import type { LiberationStage } from '../types/liberation'
import type { SymbolArea } from '../types/symbol'

describe('boss crystal calculations', () => {
  const bosses: Boss[] = [
    { id: 'lotus', name: 'Lotus', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 1000, crystalCount: 1 },
    { id: 'damien', name: 'Damien', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 2000, crystalCount: 1 },
  ]

  it('splits meso by party size and tracks character cap usage', () => {
    const result = calcCharacterIncome(
      { id: 'main', name: 'Main', selectedBossIds: ['lotus', 'damien'], partySize: 2 },
      bosses
    )

    expect(result.weeklyMeso).toBe(1500)
    expect(result.crystalsUsed).toBe(2)
    expect(result.remainingCharacterCrystals).toBe(12)
  })

  it('supports per-boss party sizes over the character default', () => {
    const result = calcCharacterIncome(
      {
        id: 'main',
        name: 'Main',
        selectedBossIds: ['lotus', 'damien'],
        partySize: 1,
        partySizeByBossId: { lotus: 2, damien: 4 },
      },
      bosses
    )

    expect(result.weeklyMeso).toBe(1000)
    expect(result.bosses.find((boss) => boss.bossId === 'lotus')?.partySize).toBe(2)
    expect(result.bosses.find((boss) => boss.bossId === 'damien')?.partySize).toBe(4)
  })

  it('caps party size by boss-specific party limits', () => {
    const result = calcCharacterIncome(
      {
        id: 'main',
        name: 'Main',
        selectedBossIds: ['limbo'],
        partySize: 6,
        partySizeByBossId: { limbo: 6 },
      },
      [{ id: 'limbo', name: 'Limbo', difficulty: 'Hard', frequency: 'weekly', mesoReboot: 3000, crystalCount: 1, partyLimit: 3 }]
    )

    expect(result.weeklyMeso).toBe(1000)
    expect(result.bosses[0].partySize).toBe(3)
  })

  it('multiplies daily bosses by weekly clear count without using character weekly cap', () => {
    const result = calcCharacterIncome(
      {
        id: 'main',
        name: 'Main',
        selectedBossIds: ['zakum'],
        partySize: 1,
        dailyClearCountByBossId: { zakum: 7 },
      },
      [{ id: 'zakum', name: 'Zakum', difficulty: 'Normal', frequency: 'daily', mesoReboot: 100, crystalCount: 1 }]
    )

    expect(result.weeklyMeso).toBe(700)
    expect(result.crystalsUsed).toBe(0)
    expect(result.remainingCharacterCrystals).toBe(14)
    expect(result.bosses[0].crystalCount).toBe(7)
  })

  it('excludes monthly bosses from weekly meso and crystal caps', () => {
    const result = calcAccountSummary(
      [{
        id: 'main',
        name: 'Main',
        selectedBossIds: ['black-mage'],
        partySize: 1,
      }],
      [{ id: 'black-mage', name: 'Black Mage', difficulty: 'Hard', frequency: 'monthly', mesoReboot: 5000, crystalCount: 1 }]
    )

    expect(result.accountTotalMeso).toBe(0)
    expect(result.accountCrystalsUsed).toBe(0)
    expect(result.characters[0].weeklyMeso).toBe(0)
    expect(result.characters[0].crystalsUsed).toBe(0)
  })

  it('flags account cap overflow', () => {
    const result = calcAccountSummary(
      Array.from({ length: 91 }, (_, index) => ({
        id: `char-${index}`,
        name: `Character ${index}`,
        selectedBossIds: ['lotus', 'damien'],
        partySize: 1,
      })),
      bosses
    )

    expect(result.accountCrystalsUsed).toBe(182)
    expect(result.isOverAccountCap).toBe(true)
    expect(result.remainingAccountCrystals).toBe(0)
  })
})

describe('EXP calculations', () => {
  const expTable = [0, 100, 200, 400]
  const buffs: ExpBuff[] = [
    { id: 'coupon-2x', label: '2x Coupon', description: '', multiplier: 2, category: 'coupon', exclusive: 'coupon' },
    { id: 'coupon-3x', label: '3x Coupon', description: '', multiplier: 3, category: 'coupon', exclusive: 'coupon' },
    { id: 'mvp', label: 'MVP', description: '', multiplier: 1.5, category: 'event' },
  ]

  it('uses the highest exclusive coupon and multiplies other buffs', () => {
    const result = calcExpSession(
      {
        id: 'main',
        name: 'Main',
        currentLevel: 2,
        currentExpPct: 0,
        baseExpPerHour: 100,
        activeBuffIds: ['coupon-2x', 'coupon-3x', 'mvp'],
        serverEventMultiplier: 1,
      },
      buffs,
      expTable
    )

    expect(result.totalMultiplier).toBe(4.5)
    expect(result.expGained30min).toBe(225)
    expect(result.pctOfLevel30min).toBe(112.5)
  })

  it('rolls flat EXP gains into later levels', () => {
    const result = calcExpProgress(1, 50, 175, expTable)

    expect(result.levelsGained).toBe(1)
    expect(result.newLevel).toBe(2)
    expect(result.newLevelPct).toBe(62.5)
  })
})

describe('symbol calculations', () => {
  const area: SymbolArea = {
    id: 'vj',
    name: 'Vanishing Journey',
    type: 'arcane',
    minLevel: 200,
    maxSymbolLevel: 4,
    dailyQuestSymbols: 20,
    weeklyDungeonSymbols: 45,
    weeklyDungeonMaxClears: 3,
    released: true,
  }

  it('subtracts current symbol EXP from remaining cost', () => {
    expect(symbolsToMax(2, 3, [10, 20, 30], 4)).toBe(47)
  })

  it('converts weekly clears into daily-equivalent income', () => {
    expect(effectiveDailySymbols(area, {
      areaId: 'vj',
      currentLevel: 1,
      currentExpSymbols: 0,
      doingDailyQuest: true,
      weeklyClears: 2,
      extraDailySymbols: 5,
    })).toBeCloseTo(37.857, 3)
  })
})

describe('liberation calculations', () => {
  const stages: LiberationStage[] = [
    { order: 1, bossName: 'Von Leon', bossMode: 'Hard', tracesRequired: 500, finalDamageReduction: 90 },
    { order: 2, bossName: 'Arkarium', bossMode: 'Normal', tracesRequired: 500, finalDamageReduction: 75 },
  ]

  it('uses ceil(remaining / weekly total) in weekly mode', () => {
    const result = calcLiberationResult(
      stages,
      {
        id: 'main',
        name: 'Main',
        currentStage: 1,
        currentTraces: 100,
        partySize: 1,
        weeklyTracesOverride: 150,
        canKillStage: {},
        mode: 'weekly',
      },
      new Date('2026-05-02T00:00:00')
    )

    expect(result.stages[0].periodsRemaining).toBe(3)
    expect(result.totalWeeksRemaining).toBe(6)
  })
})
