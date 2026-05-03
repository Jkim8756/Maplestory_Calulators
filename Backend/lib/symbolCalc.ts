import { addDays } from 'date-fns'
import type { SymbolArea, SymbolProgress } from '../../src/types/symbol'

export interface SymbolResult {
  areaId: string
  areaName: string
  currentLevel: number
  symbolsToMax: number
  effectiveDailySymbols: number
  daysToMax: number
  finishDate: Date | null  // null if 0 daily symbols (infinite)
}

export interface SymbolSummary {
  results: SymbolResult[]
  totalSymbolsToMax: number
  latestFinishDate: Date | null
}

function finiteNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function symbolsToMax(
  currentLevel: number,
  currentExpSymbols: number,
  costTable: number[],
  maxLevel: number
): number {
  const level = Math.floor(clamp(finiteNumber(currentLevel, 1), 1, maxLevel))
  if (level >= maxLevel) return 0

  const currentLevelCost = costTable[level - 1] ?? 0
  const creditedSymbols = clamp(finiteNumber(currentExpSymbols, 0), 0, Math.max(0, currentLevelCost))
  let total = -creditedSymbols

  for (let lv = level; lv < maxLevel; lv++) {
    total += costTable[lv - 1] ?? 0
  }
  return Math.max(0, total)
}

export function effectiveDailySymbols(
  area: SymbolArea,
  progress: SymbolProgress
): number {
  const fromDaily = progress.doingDailyQuest ? area.dailyQuestSymbols : 0
  const weeklyClears = clamp(
    Math.floor(finiteNumber(progress.weeklyClears, 0)),
    0,
    area.weeklyDungeonMaxClears
  )
  const fromWeekly = (area.weeklyDungeonSymbols * weeklyClears) / 7
  return Math.max(0, fromDaily + fromWeekly + finiteNumber(progress.extraDailySymbols, 0))
}

export function calcSymbolResult(
  area: SymbolArea,
  progress: SymbolProgress,
  costTable: number[],
  today: Date
): SymbolResult {
  const toMax = symbolsToMax(
    progress.currentLevel,
    progress.currentExpSymbols,
    costTable,
    area.maxSymbolLevel
  )
  const dailyRate = effectiveDailySymbols(area, progress)
  const daysToMax = dailyRate > 0 ? Math.ceil(toMax / dailyRate) : Infinity
  const finishDate = dailyRate > 0 && isFinite(daysToMax)
    ? addDays(today, daysToMax)
    : null

  return {
    areaId: area.id,
    areaName: area.name,
    currentLevel: Math.floor(clamp(finiteNumber(progress.currentLevel, 1), 1, area.maxSymbolLevel)),
    symbolsToMax: toMax,
    effectiveDailySymbols: dailyRate,
    daysToMax: isFinite(daysToMax) ? daysToMax : -1,
    finishDate,
  }
}

export function calcSymbolSummary(results: SymbolResult[]): SymbolSummary {
  const totalSymbolsToMax = results.reduce((sum, result) => sum + result.symbolsToMax, 0)
  const latestFinishDate = results.reduce<Date | null>((latest, result) => {
    if (!result.finishDate) return latest
    if (!latest || result.finishDate > latest) return result.finishDate
    return latest
  }, null)

  return { results, totalSymbolsToMax, latestFinishDate }
}
