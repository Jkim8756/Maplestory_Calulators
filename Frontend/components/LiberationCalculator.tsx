import { useMemo } from 'react'
import type { CharacterProfile } from '../App'
import { MAX_TRACES, calcLiberationResult } from '../../Backend/lib/liberationCalc'
import { formatDate, formatNumber } from '../../Backend/lib/format'
import type { CharacterLiberationState, LiberationStage } from '../../src/types/liberation'
import { Badge, Field, NumberInput, Panel, ProgressBar, Select, Toggle } from './ui'

export function LiberationCalculator({
  stages,
  characters,
  liberationState,
  activeCharacterId,
  onStateChange,
}: {
  stages: LiberationStage[]
  characters: CharacterProfile[]
  liberationState: CharacterLiberationState[]
  activeCharacterId: string
  onStateChange: (value: CharacterLiberationState[] | ((prev: CharacterLiberationState[]) => CharacterLiberationState[])) => void
}) {
  const activeState = liberationState.find((state) => state.id === activeCharacterId) ?? liberationState[0]
  const today = useMemo(() => new Date(), [])
  const result = activeState ? calcLiberationResult(stages, activeState, today) : null
  const currentStage = stages.find((stage) => stage.order === activeState?.currentStage) ?? stages[0]
  const progress = currentStage ? ((activeState?.currentTraces ?? 0) / currentStage.tracesRequired) * 100 : 0
  const tracesPerKill = Math.floor(MAX_TRACES / Math.max(1, activeState?.partySize ?? 1))

  function updateActive(patch: Partial<CharacterLiberationState>) {
    onStateChange((prev) => ensureLiberationCharacters(prev, characters).map((state) => (
      state.id === activeCharacterId ? { ...state, ...patch } : state
    )))
  }

  function setCanKill(order: number, canKill: boolean) {
    updateActive({
      canKillStage: {
        ...(activeState?.canKillStage ?? {}),
        [order]: canKill,
      },
    })
  }

  return (
    <div className="workspace-grid">
      <div className="stack">
        <Panel className="hero-panel">
          <div>
            <p className="section-kicker">AFL trace timeline</p>
            <h2>Liberation</h2>
            <p>Plan the 8-stage liberation route with monthly reset estimates or weekly trace farming.</p>
          </div>
          <Badge tone={activeState?.mode === 'weekly' ? 'teal' : 'gold'}>
            {activeState?.mode === 'weekly' ? 'Weekly mode' : 'Monthly mode'}
          </Badge>
        </Panel>

        <Panel>
          <div className="panel-heading">
            <div>
              <h3>Current Stage</h3>
              <p>Party size divides the simplified 3,000 trace kill value.</p>
            </div>
            <Toggle
              active={activeState?.mode === 'weekly'}
              label="Weekly mode"
              onChange={(active) => updateActive({ mode: active ? 'weekly' : 'monthly' })}
            />
          </div>
          <div className="grid-two">
            <Field label="Stage">
              <Select
                value={activeState?.currentStage ?? 1}
                onChange={(event) => updateActive({ currentStage: Number(event.target.value) })}
              >
                {stages.map((stage) => (
                  <option key={stage.order} value={stage.order}>
                    {stage.order}. {stage.bossMode}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Current traces">
              <NumberInput
                min={0}
                max={MAX_TRACES}
                value={activeState?.currentTraces ?? 0}
                onChange={(event) => updateActive({ currentTraces: clamp(Number(event.target.value), 0, MAX_TRACES) })}
              />
            </Field>
            <Field label="Party size">
              <NumberInput
                min={1}
                max={6}
                value={activeState?.partySize ?? 1}
                onChange={(event) => updateActive({ partySize: clamp(Number(event.target.value), 1, 6) })}
              />
            </Field>
            <Field label="Weekly traces override" hint="Used only in weekly mode. Leave 0 for party split value.">
              <NumberInput
                min={0}
                value={activeState?.weeklyTracesOverride ?? 0}
                onChange={(event) => updateActive({ weeklyTracesOverride: Math.max(0, Number(event.target.value) || 0) })}
              />
            </Field>
          </div>
          <div className="summary-total inline">
            <span>Current progress</span>
            <strong>{formatNumber(activeState?.currentTraces ?? 0)} / {formatNumber(currentStage?.tracesRequired ?? 0)}</strong>
          </div>
          <ProgressBar value={progress} tone="gold" />
        </Panel>

        <Panel>
          <div className="panel-heading">
            <div>
              <h3>Can Kill Gates</h3>
              <p>Turn off stages that are not realistically clearable yet.</p>
            </div>
          </div>
          <div className="gate-grid">
            {stages.map((stage) => (
              <Toggle
                key={stage.order}
                active={activeState?.canKillStage[stage.order] !== false}
                label={`${stage.order}. ${stage.bossName}`}
                onChange={(active) => setCanKill(stage.order, active)}
              />
            ))}
          </div>
        </Panel>
      </div>

      <aside className="side-stack">
        <Panel className="sticky-panel">
          <div className="panel-heading compact">
            <div>
              <h3>Timeline</h3>
              <p>{formatNumber(tracesPerKill)} traces per kill estimate</p>
            </div>
          </div>
          <div className="timeline">
            {result?.stages.map((stage) => (
              <div className={`timeline-step timeline-${stage.status}`} key={stage.order}>
                <div className="timeline-marker">{stage.status === 'completed' ? 'OK' : stage.order}</div>
                <div className="timeline-body">
                  <div className="timeline-title">
                    <strong>{stage.bossMode}</strong>
                    <Badge tone={stage.status === 'gated' ? 'red' : stage.status === 'current' ? 'gold' : stage.status === 'completed' ? 'teal' : 'muted'}>
                      {stage.status}
                    </Badge>
                  </div>
                  <small>{stage.tracesRequired} traces / {stage.finalDamageReduction}% FDR</small>
                  {stage.status === 'current' ? (
                    <ProgressBar value={((stage.tracesProgress ?? 0) / stage.tracesRequired) * 100} tone="gold" />
                  ) : null}
                  <span className="timeline-date">{stage.estimatedDate ? formatDate(stage.estimatedDate) : 'No estimate'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Projected finish</span>
            <strong>{result?.completionDate ? formatDate(result.completionDate) : 'Gated'}</strong>
          </div>
        </Panel>
      </aside>
    </div>
  )
}

function ensureLiberationCharacters(states: CharacterLiberationState[], characters: CharacterProfile[]) {
  const existing = new Set(states.map((state) => state.id))
  const missing = characters
    .filter((character) => !existing.has(character.id))
    .map((character) => ({
      id: character.id,
      name: character.name,
      currentStage: 1,
      currentTraces: 0,
      partySize: 1,
      weeklyTracesOverride: 0,
      canKillStage: {},
      mode: 'monthly' as const,
    }))
  return [...states, ...missing]
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}
