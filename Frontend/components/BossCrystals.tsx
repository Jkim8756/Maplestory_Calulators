import { useMemo } from 'react'
import type { CharacterProfile } from '../App'
import { CRYSTALS_ACCOUNT_CAP, CRYSTALS_PER_CHARACTER_CAP, calcAccountSummary, calcCharacterIncome } from '../../Backend/lib/bossCalc'
import { formatMeso } from '../../Backend/lib/format'
import type { Boss, BossFrequency, CharacterBossState } from '../../src/types/boss'
import { Badge, Field, NumberInput, Panel, ProgressBar } from './ui'

const frequencyLabels: Record<BossFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

const difficultyTone = {
  Easy: 'teal',
  Normal: 'muted',
  Hard: 'gold',
  Chaos: 'violet',
  Extreme: 'red',
} as const

export function BossCrystals({
  bosses,
  characters,
  bossState,
  activeCharacterId,
  onStateChange,
}: {
  bosses: Boss[]
  characters: CharacterProfile[]
  bossState: CharacterBossState[]
  activeCharacterId: string
  onStateChange: (value: CharacterBossState[] | ((prev: CharacterBossState[]) => CharacterBossState[])) => void
}) {
  const activeState = bossState.find((state) => state.id === activeCharacterId) ?? bossState[0]
  const account = useMemo(() => calcAccountSummary(bossState, bosses), [bossState, bosses])
  const activeResult = activeState ? calcCharacterIncome(activeState, bosses) : null
  const grouped = useMemo(() => groupBosses(bosses), [bosses])

  function updateActive(patch: Partial<CharacterBossState>) {
    onStateChange((prev) => ensureBossCharacters(prev, characters).map((state) => (
      state.id === activeCharacterId ? { ...state, ...patch } : state
    )))
  }

  function toggleBoss(bossId: string) {
    if (!activeState) return
    const selected = activeState.selectedBossIds.includes(bossId)
      ? activeState.selectedBossIds.filter((id) => id !== bossId)
      : [...activeState.selectedBossIds, bossId]
    updateActive({ selectedBossIds: selected })
  }

  const capTone = account.isOverAccountCap ? 'red' : account.accountCrystalsUsed > CRYSTALS_ACCOUNT_CAP * 0.85 ? 'gold' : 'teal'

  return (
    <div className="workspace-grid">
      <div className="stack">
        <Panel className="hero-panel">
          <div>
            <p className="section-kicker">Weekly income tracker</p>
            <h2>Boss Crystals</h2>
            <p>
              Select clears per character, split values by party size, and watch the 14 crystal character cap and
              180 crystal world cap.
            </p>
          </div>
          <div className="metric-row">
            <Metric label="Active weekly" value={activeResult ? formatMeso(activeResult.weeklyMeso) : '0'} tone="gold" />
            <Metric label="Active crystals" value={`${activeResult?.crystalsUsed ?? 0}/${CRYSTALS_PER_CHARACTER_CAP}`} tone={activeResult?.isOverCharacterCap ? 'red' : 'teal'} />
            <Metric label="Account weekly" value={formatMeso(account.accountTotalMeso)} tone="violet" />
          </div>
        </Panel>

        <Panel>
          <div className="panel-heading">
            <div>
              <h3>Crystal Selection</h3>
              <p>Grouped by reset frequency with per-clear Reboot values.</p>
            </div>
            <Field label="Party size">
              <NumberInput
                min={1}
                max={6}
                value={activeState?.partySize ?? 1}
                onChange={(event) => updateActive({ partySize: Math.max(1, Number(event.target.value) || 1) })}
              />
            </Field>
          </div>

          <div className="boss-groups">
            {Object.entries(grouped).map(([frequency, rows]) => (
              <div className="boss-group" key={frequency}>
                <h4>{frequencyLabels[frequency as BossFrequency]}</h4>
                <div className="table-list">
                  {rows.map((boss) => {
                    const selected = activeState?.selectedBossIds.includes(boss.id) ?? false
                    const splitValue = boss.mesoReboot / Math.max(1, activeState?.partySize ?? 1)
                    return (
                      <button
                        className={`data-row boss-row ${selected ? 'data-row-selected' : ''}`}
                        key={boss.id}
                        type="button"
                        onClick={() => toggleBoss(boss.id)}
                      >
                        <span className="check-cell">{selected ? '✓' : ''}</span>
                        <span>
                          <strong>{boss.name}</strong>
                          <small>{formatMeso(splitValue)} split value</small>
                        </span>
                        <Badge tone={difficultyTone[boss.difficulty]}>{boss.difficulty}</Badge>
                        <span className="row-value">{formatMeso(boss.mesoReboot)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <aside className="side-stack">
        <Panel className="sticky-panel">
          <div className="panel-heading compact">
            <div>
              <h3>Account Summary</h3>
              <p>{characters.length} character roster</p>
            </div>
            <Badge tone={capTone}>{account.accountCrystalsUsed}/{CRYSTALS_ACCOUNT_CAP}</Badge>
          </div>
          <ProgressBar value={(account.accountCrystalsUsed / CRYSTALS_ACCOUNT_CAP) * 100} tone={capTone} />
          <div className="summary-total">
            <span>Total weekly meso</span>
            <strong>{formatMeso(account.accountTotalMeso)}</strong>
          </div>
          <div className="mini-list">
            {account.characters.map((character) => (
              <div className="mini-row" key={character.characterId}>
                <span>{character.characterName}</span>
                <strong>{formatMeso(character.weeklyMeso)}</strong>
                <small className={character.isOverCharacterCap ? 'text-red-300' : ''}>
                  {character.crystalsUsed}/{CRYSTALS_PER_CHARACTER_CAP}
                </small>
              </div>
            ))}
          </div>
        </Panel>
      </aside>
    </div>
  )
}

function groupBosses(bosses: Boss[]): Record<BossFrequency, Boss[]> {
  return {
    daily: bosses.filter((boss) => boss.frequency === 'daily'),
    weekly: bosses.filter((boss) => boss.frequency === 'weekly'),
    monthly: bosses.filter((boss) => boss.frequency === 'monthly'),
  }
}

function ensureBossCharacters(states: CharacterBossState[], characters: CharacterProfile[]) {
  const existing = new Set(states.map((state) => state.id))
  const missing = characters
    .filter((character) => !existing.has(character.id))
    .map((character) => ({ id: character.id, name: character.name, selectedBossIds: [], partySize: 1 }))
  return [...states, ...missing]
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'violet' | 'gold' | 'teal' | 'red' }) {
  return (
    <div className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
