import { useMemo, useState } from 'react'
import type { CharacterProfile } from '../App'
import { calcSymbolResult } from '../../Backend/lib/symbolCalc'
import { formatDate, formatNumber } from '../../Backend/lib/format'
import type { CharacterSymbolState, SymbolArea, SymbolProgress, SymbolType } from '../../src/types/symbol'
import { Badge, Field, NumberInput, Panel, ProgressBar, Toggle } from './ui'

export function SymbolsCalculator({
  areas,
  costTables,
  characters,
  symbolState,
  activeCharacterId,
  onStateChange,
}: {
  areas: { arcane: SymbolArea[]; sacred: SymbolArea[] }
  costTables: { arcane: number[]; sacred: number[] }
  characters: CharacterProfile[]
  symbolState: CharacterSymbolState[]
  activeCharacterId: string
  onStateChange: (value: CharacterSymbolState[] | ((prev: CharacterSymbolState[]) => CharacterSymbolState[])) => void
}) {
  const [type, setType] = useState<SymbolType>('arcane')
  const activeState = symbolState.find((state) => state.id === activeCharacterId) ?? symbolState[0]
  const currentAreas = areas[type]
  const today = useMemo(() => new Date(), [])
  const results = currentAreas.map((area) => calcSymbolResult(area, readProgress(activeState, area), costTables[type], today))
  const totalRemaining = results.reduce((sum, result) => sum + result.symbolsToMax, 0)
  const longest = results.reduce((max, result) => Math.max(max, result.daysToMax), 0)

  function updateProgress(area: SymbolArea, patch: Partial<SymbolProgress>) {
    onStateChange((prev) => ensureSymbolCharacters(prev, characters, [...areas.arcane, ...areas.sacred]).map((state) => {
      if (state.id !== activeCharacterId) return state
      const current = readProgress(state, area)
      return {
        ...state,
        progress: {
          ...state.progress,
          [area.id]: { ...current, ...patch },
        },
      }
    }))
  }

  return (
    <div className="workspace-grid">
      <div className="stack">
        <Panel className="hero-panel">
          <div>
            <p className="section-kicker">Daily farming timeline</p>
            <h2>Symbols</h2>
            <p>Track Arcane and Sacred symbol progress with fixed daily and weekly values.</p>
          </div>
          <div className="segmented">
            <button className={`segment ${type === 'arcane' ? 'segment-active' : ''}`} type="button" onClick={() => setType('arcane')}>Arcane</button>
            <button className={`segment ${type === 'sacred' ? 'segment-active' : ''}`} type="button" onClick={() => setType('sacred')}>Sacred</button>
          </div>
        </Panel>

        <Panel>
          <div className="symbol-list">
            {currentAreas.map((area) => {
              const progress = readProgress(activeState, area)
              const result = calcSymbolResult(area, progress, costTables[type], today)
              const finishTone = result.daysToMax < 0 ? 'muted' : result.daysToMax < 30 ? 'red' : result.daysToMax <= 90 ? 'gold' : 'muted'
              const completion = 100 - (result.symbolsToMax / totalCost(costTables[type])) * 100
              return (
                <article className={`symbol-card ${!area.released ? 'symbol-card-unreleased' : ''}`} key={area.id}>
                  <div className="symbol-card-head">
                    <div>
                      <h3>{area.name}</h3>
                      <p>Lv. {area.minLevel}+ / max symbol {area.maxSymbolLevel}</p>
                    </div>
                    <div className="badge-row">
                      {!area.released ? <Badge tone="red">Coming Soon</Badge> : null}
                      <Badge tone={type === 'arcane' ? 'violet' : 'teal'}>{type}</Badge>
                    </div>
                  </div>
                  <ProgressBar value={completion} tone={type === 'arcane' ? 'violet' : 'teal'} />
                  <div className="symbol-grid">
                    <Field label="Level">
                      <NumberInput
                        min={1}
                        max={area.maxSymbolLevel}
                        value={progress.currentLevel}
                        onChange={(event) => updateProgress(area, { currentLevel: clamp(Number(event.target.value), 1, area.maxSymbolLevel) })}
                      />
                    </Field>
                    <Field label="Current symbol EXP">
                      <NumberInput
                        min={0}
                        value={progress.currentExpSymbols}
                        onChange={(event) => updateProgress(area, { currentExpSymbols: Math.max(0, Number(event.target.value) || 0) })}
                      />
                    </Field>
                    <Field label="Weekly clears">
                      <NumberInput
                        min={0}
                        max={area.weeklyDungeonMaxClears}
                        value={progress.weeklyClears}
                        onChange={(event) => updateProgress(area, { weeklyClears: clamp(Number(event.target.value), 0, area.weeklyDungeonMaxClears) })}
                      />
                    </Field>
                    <Field label="Bonus daily">
                      <NumberInput
                        min={0}
                        value={progress.extraDailySymbols}
                        onChange={(event) => updateProgress(area, { extraDailySymbols: Math.max(0, Number(event.target.value) || 0) })}
                      />
                    </Field>
                  </div>
                  <div className="symbol-footer">
                    <Toggle
                      active={progress.doingDailyQuest}
                      disabled={!area.released}
                      label="Daily quest"
                      onChange={(active) => updateProgress(area, { doingDailyQuest: active })}
                    />
                    <div className="symbol-stat">
                      <span>Remaining</span>
                      <strong>{formatNumber(result.symbolsToMax)}</strong>
                    </div>
                    <div className="symbol-stat">
                      <span>Finish</span>
                      <strong className={`tone-${finishTone}`}>
                        {result.finishDate ? formatDate(result.finishDate) : 'Paused'}
                      </strong>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </Panel>
      </div>

      <aside className="side-stack">
        <Panel className="sticky-panel">
          <div className="panel-heading compact">
            <div>
              <h3>{type === 'arcane' ? 'Arcane' : 'Sacred'} Summary</h3>
              <p>{currentAreas.length} symbol areas</p>
            </div>
          </div>
          <div className="summary-total">
            <span>Total symbols left</span>
            <strong>{formatNumber(totalRemaining)}</strong>
          </div>
          <div className="mini-list">
            <div className="mini-row">
              <span>Longest timeline</span>
              <strong>{longest > 0 ? `${longest} days` : 'Done'}</strong>
            </div>
            <div className="mini-row">
              <span>Daily rate</span>
              <strong>{formatNumber(results.reduce((sum, result) => sum + result.effectiveDailySymbols, 0))}</strong>
            </div>
          </div>
        </Panel>
      </aside>
    </div>
  )
}

function readProgress(state: CharacterSymbolState | undefined, area: SymbolArea): SymbolProgress {
  return state?.progress[area.id] ?? {
    areaId: area.id,
    currentLevel: 1,
    currentExpSymbols: 0,
    doingDailyQuest: area.released,
    weeklyClears: area.weeklyDungeonMaxClears,
    extraDailySymbols: 0,
  }
}

function ensureSymbolCharacters(states: CharacterSymbolState[], characters: CharacterProfile[], areas: SymbolArea[]) {
  const existing = new Set(states.map((state) => state.id))
  const missing = characters
    .filter((character) => !existing.has(character.id))
    .map((character) => ({
      id: character.id,
      name: character.name,
      progress: Object.fromEntries(areas.map((area) => [area.id, readProgress(undefined, area)])),
    }))
  return [...states, ...missing]
}

function totalCost(costTable: number[]) {
  return costTable.reduce((sum, value) => sum + value, 0)
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}
