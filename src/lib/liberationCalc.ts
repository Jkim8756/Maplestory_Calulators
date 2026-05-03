import { addMonths, addWeeks, startOfMonth } from 'date-fns'
import type { LiberationStage, CharacterLiberationState } from '../types/liberation'

export const MAX_TRACES = 3000

export interface StageEstimate {
  order: number
  bossName: string
  bossMode: string
  tracesRequired: number
  finalDamageReduction: number
  status: 'completed' | 'current' | 'future' | 'gated'
  estimatedDate: Date | null
  tracesProgress?: number  // only for current stage
  tracesNeeded: number
  periodsRemaining: number
}

export interface LiberationResult {
  stages: StageEstimate[]
  completionDate: Date | null
  totalMonthsRemaining: number
  totalWeeksRemaining: number
}

function finiteNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

function positiveInteger(value: number, fallback = 1): number {
  return Math.max(1, Math.floor(finiteNumber(value, fallback)))
}

export function calcLiberationResult(
  stages: LiberationStage[],
  state: CharacterLiberationState,
  today: Date
): LiberationResult {
  const partySize = positiveInteger(state.partySize)
  const tracesPerKill = Math.floor(MAX_TRACES / partySize)
  const weeklyTraces = positiveInteger(state.weeklyTracesOverride || tracesPerKill)

  const results: StageEstimate[] = []
  let monthsAccumulated = 0
  let weeksAccumulated = 0
  let carryTraces = Math.max(0, finiteNumber(state.currentTraces, 0))
  const monthlyBase = startOfMonth(today)

  for (const stage of stages) {
    if (stage.order < state.currentStage) {
      results.push({
        ...stage,
        status: 'completed',
        estimatedDate: null,
        tracesNeeded: 0,
        periodsRemaining: 0,
      })
      continue
    }

    const canKill = state.canKillStage[stage.order] !== false // default true
    const needed = Math.max(0, stage.tracesRequired - carryTraces)

    if (!canKill) {
      results.push({
        ...stage,
        status: 'gated',
        estimatedDate: null,
        tracesNeeded: needed,
        periodsRemaining: 0,
      })
      continue
    }

    const status = stage.order === state.currentStage ? 'current' : 'future'

    if (stage.order === state.currentStage) {
      if (state.mode === 'weekly') {
        const weeksLeft = needed <= 0 ? 0 : Math.ceil(needed / weeklyTraces)
        weeksAccumulated += weeksLeft
        const estimatedDate = addWeeks(today, weeksLeft)
        results.push({
          ...stage,
          status,
          estimatedDate,
          tracesProgress: carryTraces,
          tracesNeeded: needed,
          periodsRemaining: weeksLeft,
        })
        carryTraces = Math.max(0, carryTraces + weeklyTraces * weeksLeft - stage.tracesRequired)
      } else {
        // Monthly mode: 1 kill per reset
        const monthsNeeded = needed <= 0 ? 0 : Math.ceil(needed / tracesPerKill)
        monthsAccumulated += monthsNeeded
        results.push({
          ...stage,
          status,
          estimatedDate: addMonths(monthlyBase, monthsAccumulated),
          tracesProgress: carryTraces,
          tracesNeeded: needed,
          periodsRemaining: monthsNeeded,
        })
        carryTraces = Math.max(0, carryTraces + tracesPerKill * monthsNeeded - stage.tracesRequired)
      }
    } else {
      if (state.mode === 'weekly') {
        const weeksLeft = needed <= 0 ? 0 : Math.ceil(needed / weeklyTraces)
        weeksAccumulated += weeksLeft
        results.push({
          ...stage,
          status,
          estimatedDate: addWeeks(today, weeksAccumulated),
          tracesNeeded: needed,
          periodsRemaining: weeksLeft,
        })
        carryTraces = Math.max(0, carryTraces + weeklyTraces * weeksLeft - stage.tracesRequired)
      } else {
        const monthsNeeded = needed <= 0 ? 0 : Math.ceil(needed / tracesPerKill)
        monthsAccumulated += monthsNeeded
        results.push({
          ...stage,
          status,
          estimatedDate: addMonths(monthlyBase, monthsAccumulated),
          tracesNeeded: needed,
          periodsRemaining: monthsNeeded,
        })
        carryTraces = Math.max(0, carryTraces + tracesPerKill * monthsNeeded - stage.tracesRequired)
      }
    }
  }

  const lastStage = results[results.length - 1]
  const completionDate = lastStage?.estimatedDate ?? null
  const totalMonthsRemaining = state.mode === 'monthly'
    ? monthsAccumulated
    : Math.ceil(weeksAccumulated / 4)

  return { stages: results, completionDate, totalMonthsRemaining, totalWeeksRemaining: weeksAccumulated }
}
