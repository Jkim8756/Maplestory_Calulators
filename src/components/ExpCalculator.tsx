import { useMemo, useState } from 'react'
import type { CharacterProfile } from '../App'
import { calcExpProgress, calcExpSession, resolveBuffs } from '../lib/expCalc'
import { formatExpLarge, formatPct } from '../lib/format'
import type { ExpBuff, ExpCharacterState } from '../types/exp'
import { Badge, Button, Field, NumberInput, Panel, ProgressBar, Toggle } from './ui'

type ExpMode = 'session' | 'progress'

export function ExpCalculator({
  buffs,
  expTable,
  characters,
  expState,
  activeCharacterId,
  onStateChange,
}: {
  buffs: ExpBuff[]
  expTable: number[]
  characters: CharacterProfile[]
  expState: ExpCharacterState[]
  activeCharacterId: string
  onStateChange: (value: ExpCharacterState[] | ((prev: ExpCharacterState[]) => ExpCharacterState[])) => void
}) {
  const [mode, setMode] = useState<ExpMode>('session')
  const [flatGain, setFlatGain] = useState(5_000_000_000_000)
  const activeState = expState.find((state) => state.id === activeCharacterId) ?? expState[0]
  const resolved = useMemo(
    () => resolveBuffs(buffs, activeState?.activeBuffIds ?? []),
    [buffs, activeState?.activeBuffIds]
  )
  const sessionResult = activeState ? calcExpSession(activeState, buffs, expTable) : null
  const progressResult = activeState ? calcExpProgress(activeState.currentLevel, activeState.currentExpPct, flatGain, expTable) : null

  function updateActive(patch: Partial<ExpCharacterState>) {
    onStateChange((prev) => ensureExpCharacters(prev, characters).map((state) => (
      state.id === activeCharacterId ? { ...state, ...patch } : state
    )))
  }

  function toggleBuff(buffId: string) {
    if (!activeState) return
    const active = activeState.activeBuffIds.includes(buffId)
    updateActive({
      activeBuffIds: active
        ? activeState.activeBuffIds.filter((id) => id !== buffId)
        : [...activeState.activeBuffIds, buffId],
    })
  }

  return (
    <div className="workspace-grid">
      <div className="stack">
        <Panel className="hero-panel">
          <div>
            <p className="section-kicker">Training planner</p>
            <h2>EXP Calculator</h2>
            <p>Estimate a 30-minute training session or apply flat EXP gains to current level progress.</p>
          </div>
          <div className="segmented">
            <Button variant={mode === 'session' ? 'primary' : 'secondary'} onClick={() => setMode('session')}>Session</Button>
            <Button variant={mode === 'progress' ? 'primary' : 'secondary'} onClick={() => setMode('progress')}>Progress</Button>
          </div>
        </Panel>

        <Panel>
          <div className="grid-two">
            <Field label="Current level">
              <NumberInput
                min={1}
                max={299}
                value={activeState?.currentLevel ?? 1}
                onChange={(event) => updateActive({ currentLevel: clamp(Number(event.target.value), 1, 299) })}
              />
            </Field>
            <Field label="Current EXP %">
              <NumberInput
                min={0}
                max={99.99}
                step={0.01}
                value={activeState?.currentExpPct ?? 0}
                onChange={(event) => updateActive({ currentExpPct: clamp(Number(event.target.value), 0, 99.99) })}
              />
            </Field>
          </div>
        </Panel>

        {mode === 'session' ? (
          <Panel>
            <div className="panel-heading">
              <div>
                <h3>Session Inputs</h3>
                <p>Coupon buffs are exclusive; the highest active coupon wins.</p>
              </div>
              <Badge tone="violet">{sessionResult?.totalMultiplier.toFixed(2)}x total</Badge>
            </div>
            <div className="grid-two">
              <Field label="Base EXP per hour">
                <NumberInput
                  min={0}
                  value={activeState?.baseExpPerHour ?? 0}
                  onChange={(event) => updateActive({ baseExpPerHour: Math.max(0, Number(event.target.value) || 0) })}
                />
              </Field>
              <Field label="Server event multiplier">
                <NumberInput
                  min={1}
                  step={0.1}
                  value={activeState?.serverEventMultiplier ?? 1}
                  onChange={(event) => updateActive({ serverEventMultiplier: Math.max(1, Number(event.target.value) || 1) })}
                />
              </Field>
            </div>
            <div className="buff-grid">
              {buffs.map((buff) => {
                const isActive = activeState?.activeBuffIds.includes(buff.id) ?? false
                const disabledByStacking = resolved.disabledBuffIds.has(buff.id)
                return (
                  <button
                    key={buff.id}
                    className={`buff-card ${isActive ? 'buff-card-active' : ''} ${disabledByStacking ? 'buff-card-muted' : ''}`}
                    type="button"
                    onClick={() => toggleBuff(buff.id)}
                  >
                    <span>{buff.label}</span>
                    <strong>{buff.multiplier.toFixed(1)}x</strong>
                    <small>{buff.description}</small>
                  </button>
                )
              })}
            </div>
          </Panel>
        ) : (
          <Panel>
            <div className="panel-heading">
              <div>
                <h3>Progress Inputs</h3>
                <p>Add event rewards, vouchers, sauna ticks, or a manual EXP package.</p>
              </div>
            </div>
            <Field label="Flat EXP gain">
              <NumberInput min={0} value={flatGain} onChange={(event) => setFlatGain(Math.max(0, Number(event.target.value) || 0))} />
            </Field>
          </Panel>
        )}
      </div>

      <aside className="side-stack">
        <Panel className="sticky-panel">
          <div className="panel-heading compact">
            <div>
              <h3>{mode === 'session' ? '30-Min Result' : 'Progress Result'}</h3>
              <p>Level EXP target: {formatExpLarge(expTable[activeState?.currentLevel ?? 1] ?? 0)}</p>
            </div>
          </div>
          {mode === 'session' ? (
            <>
              <div className="summary-total">
                <span>EXP gained</span>
                <strong>{formatExpLarge(sessionResult?.expGained30min ?? 0)}</strong>
              </div>
              <ProgressBar value={(sessionResult?.pctOfLevel30min ?? 0) * 100} tone="teal" />
              <div className="mini-list">
                {sessionResult?.breakdown.map((item) => (
                  <div className="mini-row" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="summary-total">
                <span>New level</span>
                <strong>{progressResult?.newLevel ?? activeState?.currentLevel}</strong>
              </div>
              <ProgressBar value={progressResult?.newLevelPct ?? 0} tone="gold" />
              <div className="mini-list">
                <div className="mini-row">
                  <span>Levels gained</span>
                  <strong>{progressResult?.levelsGained ?? 0}</strong>
                </div>
                <div className="mini-row">
                  <span>New EXP %</span>
                  <strong>{(progressResult?.newExpPct ?? 0).toFixed(2)}%</strong>
                </div>
              </div>
            </>
          )}
          <Toggle
            active={(activeState?.serverEventMultiplier ?? 1) > 1}
            label="Quick 2x event"
            onChange={(active) => updateActive({ serverEventMultiplier: active ? 2 : 1 })}
          />
          <p className="fine-print">Session percent: {formatPct(sessionResult?.pctOfLevel30min ?? 0)}</p>
        </Panel>
      </aside>
    </div>
  )
}

function ensureExpCharacters(states: ExpCharacterState[], characters: CharacterProfile[]) {
  const existing = new Set(states.map((state) => state.id))
  const missing = characters
    .filter((character) => !existing.has(character.id))
    .map((character) => ({
      id: character.id,
      name: character.name,
      currentLevel: 260,
      currentExpPct: 0,
      baseExpPerHour: 1_000_000_000_000,
      activeBuffIds: [],
      serverEventMultiplier: 1,
    }))
  return [...states, ...missing]
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}
