import { useMemo, useState } from 'react'
import type { CSSProperties, FocusEvent, MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import type { CharacterProfile } from '../App'
import { CRYSTALS_ACCOUNT_CAP, CRYSTALS_PER_CHARACTER_CAP, calcAccountSummary } from '../lib/bossCalc'
import { formatMeso, formatMesoFull } from '../lib/format'
import type { Boss, BossDifficulty, BossFrequency, CharacterBossState } from '../types/boss'
import { Button, Field, NumberInput, Panel, ProgressBar, Select, TextInput } from './ui'

type SortKey = 'custom' | 'boss' | 'level' | 'tier' | 'price' | 'party' | 'weeklyClears' | 'split'
type SortDirection = 'asc' | 'desc'
type NumberMode = 'full' | 'compact'

const difficultyOrder: BossDifficulty[] = ['Easy', 'Normal', 'Hard', 'Chaos', 'Extreme']
const frequencyOrder: BossFrequency[] = ['daily', 'weekly', 'monthly']

interface BossFamily {
  key: string
  name: string
  frequency: BossFrequency
  thumbnailUrl?: string
  themeColor?: string
  difficulties: Boss[]
}

export function BossCrystals({
  bosses,
  characters,
  bossState,
  activeCharacterId,
  onStateChange,
  onCharacterChange,
  onRenameCharacter,
  onRemoveCharacter,
  onMoveCharacter,
}: {
  bosses: Boss[]
  characters: CharacterProfile[]
  bossState: CharacterBossState[]
  activeCharacterId: string
  onStateChange: (value: CharacterBossState[] | ((prev: CharacterBossState[]) => CharacterBossState[])) => void
  onCharacterChange: (id: string) => void
  onRenameCharacter: (id: string, name: string) => void
  onRemoveCharacter: (id: string) => void
  onMoveCharacter: (id: string, targetId: string) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('level')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [numberMode, setNumberMode] = useState<NumberMode>('full')
  const [editCharacters, setEditCharacters] = useState(false)
  const [draggingBossKey, setDraggingBossKey] = useState<string | null>(null)
  const [draggingCharacterId, setDraggingCharacterId] = useState<string | null>(null)
  const [popover, setPopover] = useState<{ family: BossFamily; left: number; top: number } | null>(null)
  const [customOrder, setCustomOrder] = useLocalStringArray('ms_calc_boss_custom_order')
  const [pinnedBosses, setPinnedBosses] = useLocalStringArray('ms_calc_boss_pins')
  const [collapsedSections, setCollapsedSections] = useLocalStringArray('ms_calc_boss_collapsed_sections')

  const activeState = normalizeBossState(bossState.find((state) => state.id === activeCharacterId) ?? bossState[0])
  const account = useMemo(() => calcAccountSummary(bossState.map(normalizeBossState), bosses), [bossState, bosses])
  const families = useMemo(
    () => orderBossFamilies(toBossFamilies(bosses), sortKey, sortDirection, customOrder, pinnedBosses, activeState),
    [activeState, bosses, customOrder, pinnedBosses, sortDirection, sortKey]
  )

  const selectedBossIds = new Set(activeState.selectedBossIds)
  const activeWeeklyMeso = bosses
    .filter((boss) => selectedBossIds.has(boss.id) && boss.frequency !== 'monthly')
    .reduce((total, boss) => total + splitValue(activeState, boss), 0)
  const capTone = account.isOverAccountCap ? 'red' : account.accountCrystalsUsed > CRYSTALS_ACCOUNT_CAP * 0.85 ? 'gold' : 'teal'
  const accountCrystalPct = Math.min(100, (account.accountCrystalsUsed / CRYSTALS_ACCOUNT_CAP) * 100)
  const price = (value: number) => numberMode === 'full' ? formatMesoFull(value) : formatMeso(value)

  function updateActive(mutator: (state: CharacterBossState) => CharacterBossState) {
    onStateChange((prev) => ensureBossCharacters(prev, characters).map((state) => (
      state.id === activeCharacterId ? mutator(normalizeBossState(state)) : normalizeBossState(state)
    )))
  }

  function resetActiveBosses() {
    updateActive((state) => ({
      ...state,
      selectedBossIds: [],
      partySizeByBossId: {},
      dailyClearCountByBossId: {},
    }))
  }

  function resetAllCharacters() {
    onStateChange((prev) => ensureBossCharacters(prev, characters).map((state) => ({
      ...normalizeBossState(state),
      selectedBossIds: [],
      partySizeByBossId: {},
      dailyClearCountByBossId: {},
    })))
  }

  function selectDifficulty(family: BossFamily, boss: Boss) {
    updateActive((state) => {
      const familyIds = new Set(family.difficulties.map((difficulty) => difficulty.id))
      const alreadySelected = state.selectedBossIds.includes(boss.id)
      const selectedBossIds = state.selectedBossIds.filter((id) => !familyIds.has(id))
      return {
        ...state,
        selectedBossIds: alreadySelected ? selectedBossIds : [...selectedBossIds, boss.id],
        partySizeByBossId: {
          ...state.partySizeByBossId,
          [boss.id]: getPartySize(state, boss),
        },
        dailyClearCountByBossId: {
          ...state.dailyClearCountByBossId,
          [boss.id]: getWeeklyClears(state, boss),
        },
      }
    })
  }

  function updatePartySize(boss: Boss, partySize: number) {
    updateActive((state) => ({
      ...state,
      partySizeByBossId: {
        ...state.partySizeByBossId,
        [boss.id]: clampInt(partySize, 1, partyLimit(boss), 1),
      },
    }))
  }

  function updateWeeklyClears(bossId: string, clears: number) {
    updateActive((state) => ({
      ...state,
      dailyClearCountByBossId: {
        ...state.dailyClearCountByBossId,
        [bossId]: clampInt(clears, 0, 7, 7),
      },
    }))
  }

  function toggleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(nextKey)
      setSortDirection(nextKey === 'price' || nextKey === 'split' ? 'desc' : 'asc')
    }
  }

  function togglePin(name: string) {
    setPinnedBosses((prev) => prev.includes(name) ? prev.filter((bossName) => bossName !== name) : [...prev, name])
  }

  function moveBoss(sourceName: string, targetName: string) {
    if (!sourceName || sourceName === targetName) return
    const baseOrder = mergeOrder(customOrder, families.map((family) => family.key))
    const from = baseOrder.indexOf(sourceName)
    const to = baseOrder.indexOf(targetName)
    if (from < 0 || to < 0) return
    const next = [...baseOrder]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setCustomOrder(next)
    setSortKey('custom')
    setSortDirection('asc')
  }

  function toggleSection(frequency: BossFrequency) {
    setCollapsedSections((prev) => prev.includes(frequency)
      ? prev.filter((section) => section !== frequency)
      : [...prev, frequency])
  }

  function showBossPopover(event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>, family: BossFamily) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = 360
    setPopover({
      family,
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      top: Math.min(rect.bottom + 8, window.innerHeight - 80),
    })
  }

  return (
    <div className={`boss-workspace ${editCharacters ? 'boss-editing' : ''}`}>
      <aside className="boss-summary-rail">
        <Panel className="sticky-panel account-panel">
          <div className="panel-heading compact">
            <div>
              <h3>Account Summary</h3>
              <p>Weekly boss crystal planner</p>
            </div>
            <div className="summary-actions">
              <Button variant="secondary" onClick={resetAllCharacters}>Reset account</Button>
              <Button variant="secondary" onClick={() => setEditCharacters((value) => !value)}>
                {editCharacters ? 'Done' : 'Edit'}
              </Button>
            </div>
          </div>
          <ProgressBar value={(account.accountCrystalsUsed / CRYSTALS_ACCOUNT_CAP) * 100} tone={capTone} />
          <div className="summary-total boss-total">
            <span>Total weekly meso</span>
            <strong><MesoIcon />{price(account.accountTotalMeso)}</strong>
            <div className="crystal-counter-row">
              <span className="crystal-counter-progress" aria-hidden="true">
                <span style={{ width: `${accountCrystalPct}%` }} />
              </span>
              <small>{Math.round(accountCrystalPct)}% / {account.accountCrystalsUsed}/{CRYSTALS_ACCOUNT_CAP} crystals</small>
            </div>
          </div>
          <div className="summary-total inline">
            <span>Active character</span>
            <strong><MesoIcon />{price(activeWeeklyMeso)}</strong>
          </div>
          <div className="mini-list">
            {account.characters.map((character, index) => {
              const profile = characters.find((item) => item.id === character.characterId)
              return (
                <div
                  className={`mini-row ${!editCharacters && character.characterId === activeCharacterId ? 'mini-row-active' : ''} ${draggingCharacterId === character.characterId ? 'mini-row-dragging' : ''}`}
                  draggable={editCharacters}
                  key={character.characterId}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', character.characterId)
                    setDraggingCharacterId(character.characterId)
                  }}
                  onDragEnd={() => setDraggingCharacterId(null)}
                  onDragOver={(event) => editCharacters && event.preventDefault()}
                  onDrop={(event) => {
                    const draggedId = event.dataTransfer.getData('text/plain')
                    setDraggingCharacterId(null)
                    if (draggedId) onMoveCharacter(draggedId, character.characterId)
                  }}
                >
                  {editCharacters ? (
                    <>
                      <button className="drag-handle" type="button" draggable aria-label={`Drag ${character.characterName}`}>
                        <DragIcon />
                      </button>
                      <TextInput
                        aria-label={`Rename ${character.characterName}`}
                        value={profile?.name ?? character.characterName}
                        onChange={(event) => onRenameCharacter(character.characterId, event.target.value)}
                      />
                      <button className="remove-character" type="button" onClick={() => onRemoveCharacter(character.characterId)} disabled={characters.length <= 1}>
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="mini-name-button" type="button" onClick={() => onCharacterChange(character.characterId)}>
                        <span>{index + 1}.</span> {character.characterName}
                      </button>
                      <strong><MesoIcon />{price(character.weeklyMeso)}</strong>
                      <small className={character.isOverCharacterCap ? 'text-red-300' : ''}>
                        {character.crystalsUsed}/{CRYSTALS_PER_CHARACTER_CAP}
                      </small>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>
      </aside>

      <div className="stack">
        <Panel className="boss-toolbar">
          <div>
            <p className="section-kicker">Weekly income tracker</p>
            <h2>Boss Crystals</h2>
            <p>Click table headers to sort. Daily clears count toward the 180 account cap, not the {CRYSTALS_PER_CHARACTER_CAP} weekly character cap.</p>
          </div>
          <div className="toolbar-controls">
            <Button variant="secondary" onClick={resetActiveBosses}>Reset All</Button>
            <Field label="Number format">
              <Select value={numberMode} onChange={(event) => setNumberMode(event.target.value as NumberMode)}>
                <option value="full">Number</option>
                <option value="compact">Compact</option>
              </Select>
            </Field>
          </div>
        </Panel>

        {frequencyOrder.map((frequency) => {
          const sectionFamilies = families.filter((family) => family.frequency === frequency)
          if (sectionFamilies.length === 0) return null
          const collapsed = collapsedSections.includes(frequency)
          const isDaily = frequency === 'daily'
          return (
            <Panel className="boss-table-panel" key={frequency}>
              <button className="boss-section-title" type="button" onClick={() => toggleSection(frequency)}>
                <span>
                  <h3>{frequency === 'daily' ? 'Daily Bosses' : frequency === 'weekly' ? 'Weekly Bosses' : 'Monthly Bosses'}</h3>
                  <p>{isDaily ? 'Set 0-7 clears per week.' : 'One selected difficulty per boss.'}</p>
                </span>
                <strong>{collapsed ? 'Show' : 'Hide'}</strong>
              </button>
              {!collapsed ? (
                <>
                  <div className={`boss-table-head ${isDaily ? 'boss-table-head-daily' : 'boss-table-head-standard'}`}>
                    <span>Order</span>
                    <HeaderButton active={sortKey === 'boss'} direction={sortDirection} onClick={() => toggleSort('boss')}>Boss</HeaderButton>
                    <HeaderButton active={sortKey === 'level'} direction={sortDirection} onClick={() => toggleSort('level')}>Lv.</HeaderButton>
                    {isDaily ? (
                      <HeaderButton active={sortKey === 'weeklyClears'} direction={sortDirection} onClick={() => toggleSort('weeklyClears')}>Clears</HeaderButton>
                    ) : (
                      <HeaderButton active={sortKey === 'tier'} direction={sortDirection} onClick={() => toggleSort('tier')}>Tier</HeaderButton>
                    )}
                    <span>Difficulty</span>
                    <HeaderButton active={sortKey === 'party'} direction={sortDirection} onClick={() => toggleSort('party')}>Party</HeaderButton>
                    <HeaderButton active={sortKey === 'price'} direction={sortDirection} onClick={() => toggleSort('price')}>Crystal</HeaderButton>
                    <HeaderButton active={sortKey === 'split'} direction={sortDirection} onClick={() => toggleSort('split')}>Split</HeaderButton>
                  </div>
                  <div className="boss-family-list">
                    {sectionFamilies.map((family) => {
                      const selected = family.difficulties.find((boss) => selectedBossIds.has(boss.id))
                      const displayedBoss = selected ?? highestValueBoss(family.difficulties)
                      const partySize = getPartySize(activeState, displayedBoss)
                      const weeklyClears = getWeeklyClears(activeState, displayedBoss)
                      const rowCrystalValue = selected ? price(selected.mesoReboot) : '-'
                      const rowSplitValue = selected ? price(splitValue(activeState, selected)) : '0'
                      const monthlyPotential = selected?.frequency === 'monthly' ? price(potentialSplitValue(activeState, selected)) : ''
                      return (
                        <div
                          className={`boss-family-row ${isDaily ? 'boss-family-row-daily' : 'boss-family-row-standard'} ${selected ? 'boss-family-selected' : ''} ${draggingBossKey === family.key ? 'boss-family-row-dragging' : ''}`}
                          key={family.key}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            moveBoss(event.dataTransfer.getData('text/plain'), family.key)
                            setDraggingBossKey(null)
                          }}
                        >
                          <div className="row-order-cell">
                            <button
                              className="drag-handle"
                              type="button"
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData('text/plain', family.key)
                                setDraggingBossKey(family.key)
                              }}
                              onDragEnd={() => setDraggingBossKey(null)}
                              aria-label={`Drag ${family.name}`}
                            >
                              <DragIcon />
                            </button>
                            <button className={`pin-button ${pinnedBosses.includes(family.key) ? 'pin-button-active' : ''}`} type="button" onClick={() => togglePin(family.key)} aria-label={`Pin ${family.name}`}>
                              *
                            </button>
                          </div>

                          <div
                            className="boss-identity-wrap"
                            onMouseEnter={(event) => showBossPopover(event, family)}
                            onMouseLeave={() => setPopover(null)}
                            onFocus={(event) => showBossPopover(event, family)}
                            onBlur={() => setPopover(null)}
                          >
                            <div className="boss-identity">
                              <div className="boss-thumb" style={{ background: family.themeColor }}>
                                {family.thumbnailUrl ? <img alt="" src={family.thumbnailUrl} /> : null}
                              </div>
                              <div>
                                <strong>{family.name}</strong>
                                <small>Limit {partyLimit(displayedBoss)} party members</small>
                              </div>
                            </div>
                          </div>

                          <span className="boss-level">{displayedBoss.levelRequirement ?? '-'}</span>
                          {isDaily ? (
                            <NumberInput
                              aria-label={`${family.name} weekly daily clears`}
                              className="party-size-input"
                              min={0}
                              max={7}
                              value={weeklyClears}
                              onChange={(event) => updateWeeklyClears(displayedBoss.id, Number(event.target.value))}
                            />
                          ) : (
                            <span className="boss-tier">{renderTier(displayedBoss.inGameTier)}</span>
                          )}

                          <div className="difficulty-buttons" aria-label={`${family.name} difficulty`}>
                            {family.difficulties.map((boss) => {
                              const isSelected = selectedBossIds.has(boss.id)
                              return (
                                <button
                                  className={`difficulty-button ${isSelected ? 'difficulty-button-active' : ''}`}
                                  key={boss.id}
                                  type="button"
                                  onClick={() => selectDifficulty(family, boss)}
                                >
                                  <span className="difficulty-label">{boss.difficulty}</span>
                                  <small className="difficulty-price"><CrystalIcon frequency={boss.frequency} />{price(boss.mesoReboot)}</small>
                                </button>
                              )
                            })}
                          </div>

                          <NumberInput
                            aria-label={`${family.name} party size`}
                            className="party-size-input"
                            min={1}
                            max={partyLimit(displayedBoss)}
                            value={partySize}
                            onChange={(event) => updatePartySize(displayedBoss, Number(event.target.value))}
                          />

                          <span className={`boss-price ${selected ? '' : 'boss-price-empty'}`}>
                            {selected ? <CrystalIcon frequency={displayedBoss.frequency} /> : null}{rowCrystalValue}
                          </span>
                          <span className="boss-price split">
                            <span><MesoIcon />{rowSplitValue}</span>
                            {monthlyPotential ? <small>({monthlyPotential})</small> : null}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : null}
            </Panel>
          )
        })}
      </div>
      {popover ? createPortal(
        <BossPopover family={popover.family} price={price} style={{ left: popover.left, top: popover.top }} />,
        document.body
      ) : null}
    </div>
  )
}

function HeaderButton({ active, direction, onClick, children }: { active: boolean; direction: SortDirection; onClick: () => void; children: string }) {
  return (
    <button className={`table-sort-button ${active ? 'table-sort-active' : ''}`} type="button" onClick={onClick}>
      <span>{children}</span>
      {active ? <span className="sort-indicator" aria-hidden="true">{direction === 'asc' ? '▲' : '▼'}</span> : null}
    </button>
  )
}

function BossPopover({ family, price, style }: { family: BossFamily; price: (value: number) => string; style?: CSSProperties }) {
  return (
    <div className="boss-popover" role="tooltip" style={style}>
      <div className="boss-popover-head">
        <strong>{family.name}</strong>
        <span>Boss details</span>
      </div>
      <div className="boss-popover-difficulties">
        {family.difficulties.map((boss) => (
          <div className="boss-popover-difficulty" key={boss.id}>
            <div>
              <span>{boss.difficulty}</span>
              <strong><CrystalIcon frequency={boss.frequency} />{price(boss.mesoReboot)}</strong>
            </div>
            <small>{boss.drops?.length ? boss.drops.join(', ') : 'Drops not verified yet'}</small>
          </div>
        ))}
      </div>
      <p>Drop data is shown only when verified.</p>
    </div>
  )
}

function toBossFamilies(bosses: Boss[]): BossFamily[] {
  const map = new Map<string, Boss[]>()
  for (const boss of bosses) {
    const key = `${boss.frequency}:${boss.name}`
    map.set(key, [...(map.get(key) ?? []), boss])
  }

  return Array.from(map.entries()).map(([key, difficulties]) => {
    const sorted = [...difficulties].sort((a, b) => difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty))
    const first = sorted[0]
    return {
      key,
      name: first.name,
      frequency: sorted.some((boss) => boss.frequency === 'monthly') ? 'monthly' : sorted.some((boss) => boss.frequency === 'weekly') ? 'weekly' : 'daily',
      thumbnailUrl: first.thumbnailUrl,
      themeColor: first.themeColor,
      difficulties: sorted,
    }
  })
}

function orderBossFamilies(
  families: BossFamily[],
  sortKey: SortKey,
  sortDirection: SortDirection,
  customOrder: string[],
  pinnedBosses: string[],
  activeState: CharacterBossState | undefined
): BossFamily[] {
  const pinned = new Set(pinnedBosses)
  const customIndex = new Map(mergeOrder(customOrder, families.map((family) => family.key)).map((key, index) => [key, index]))
  const compare = (a: BossFamily, b: BossFamily) => {
    const displayedA = selectedOrHighest(a, activeState)
    const displayedB = selectedOrHighest(b, activeState)
    const dir = sortDirection === 'asc' ? 1 : -1
    if (sortKey === 'boss') return a.name.localeCompare(b.name) * dir
    if (sortKey === 'level') return (((displayedA.levelRequirement ?? Number.MAX_SAFE_INTEGER) - (displayedB.levelRequirement ?? Number.MAX_SAFE_INTEGER)) || a.name.localeCompare(b.name)) * dir
    if (sortKey === 'tier') return ((displayedA.inGameTier || '~').localeCompare(displayedB.inGameTier || '~') || a.name.localeCompare(b.name)) * dir
    if (sortKey === 'price') return (displayedA.mesoReboot - displayedB.mesoReboot) * dir
    if (sortKey === 'party') return (getPartySize(activeState, displayedA) - getPartySize(activeState, displayedB)) * dir
    if (sortKey === 'weeklyClears') return (getWeeklyClears(activeState, displayedA) - getWeeklyClears(activeState, displayedB)) * dir
    if (sortKey === 'split') return (splitValue(activeState, displayedA) - splitValue(activeState, displayedB)) * dir
    return ((customIndex.get(a.key) ?? 0) - (customIndex.get(b.key) ?? 0)) || a.name.localeCompare(b.name)
  }

  const pinnedFamilies = families.filter((family) => pinned.has(family.key)).sort((a, b) => (customIndex.get(a.key) ?? 0) - (customIndex.get(b.key) ?? 0))
  const unpinnedFamilies = families.filter((family) => !pinned.has(family.key)).sort(compare)
  return [...pinnedFamilies, ...unpinnedFamilies]
}

function selectedOrHighest(family: BossFamily, activeState: CharacterBossState | undefined): Boss {
  const selectedIds = new Set(activeState?.selectedBossIds ?? [])
  return family.difficulties.find((boss) => selectedIds.has(boss.id)) ?? highestValueBoss(family.difficulties)
}

function highestValueBoss(bosses: Boss[]): Boss {
  return bosses.reduce((highest, boss) => boss.mesoReboot > highest.mesoReboot ? boss : highest, bosses[0])
}

function normalizeBossState(state: CharacterBossState | undefined): CharacterBossState {
  return {
    id: state?.id ?? 'main',
    name: state?.name ?? 'Main',
    selectedBossIds: state?.selectedBossIds ?? [],
    partySize: state?.partySize || 1,
    partySizeByBossId: state?.partySizeByBossId ?? {},
    dailyClearCountByBossId: state?.dailyClearCountByBossId ?? {},
  }
}

function getPartySize(state: CharacterBossState | undefined, boss: Boss): number {
  return clampInt(state?.partySizeByBossId?.[boss.id] ?? state?.partySize ?? 1, 1, partyLimit(boss), 1)
}

function getWeeklyClears(state: CharacterBossState | undefined, boss: Boss): number {
  if (boss.frequency !== 'daily') return 1
  return clampInt(state?.dailyClearCountByBossId?.[boss.id] ?? 7, 0, 7, 7)
}

function splitValue(state: CharacterBossState | undefined, boss: Boss): number {
  if (boss.frequency === 'monthly') return 0
  return potentialSplitValue(state, boss)
}

function potentialSplitValue(state: CharacterBossState | undefined, boss: Boss): number {
  return Math.floor(boss.mesoReboot / getPartySize(state, boss)) * getWeeklyClears(state, boss)
}

function partyLimit(boss: Boss): number {
  const fallbackLimit = boss.name === 'First Adversary' || boss.name === 'Limbo' || boss.name === 'Baldrix' ? 3 : 6
  return Math.max(1, Math.floor(boss.partyLimit ?? fallbackLimit))
}

function renderTier(tier: string | undefined): string | JSX.Element {
  if (!tier) return '-'
  const tierNumber = Number(tier)
  if (!Number.isFinite(tierNumber) || tierNumber <= 0) return tier
  return (
    <span className="tier-stars" title={`Tier ${tier}`}>
      {chunk(Array.from({ length: Math.min(10, Math.floor(tierNumber)) }), 5).map((group, groupIndex) => (
        <span className="tier-star-row" key={groupIndex}>
          {group.map((_, index) => <span key={index}>★</span>)}
        </span>
      ))}
    </span>
  )
}

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = []
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size))
  return groups
}

function ensureBossCharacters(states: CharacterBossState[], characters: CharacterProfile[]) {
  const existing = new Set(states.map((state) => state.id))
  const missing = characters
    .filter((character) => !existing.has(character.id))
    .map((character) => ({ id: character.id, name: character.name, selectedBossIds: [], partySize: 1, partySizeByBossId: {}, dailyClearCountByBossId: {} }))
  return [...states.map(normalizeBossState), ...missing]
}

function clampInt(value: number, min: number, max: number, fallback: number): number {
  const number = Number.isFinite(value) ? value : fallback
  return Math.max(min, Math.min(max, Math.floor(number)))
}

function mergeOrder(order: string[], names: string[]): string[] {
  const current = new Set(names)
  return [...order.filter((name) => current.has(name)), ...names.filter((name) => !order.includes(name))]
}

function useLocalStringArray(key: string): [string[], (value: string[] | ((prev: string[]) => string[])) => void] {
  const [value, setValue] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(key)
      const parsed = stored ? JSON.parse(stored) : []
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  })

  function update(nextValue: string[] | ((prev: string[]) => string[])) {
    setValue((prev) => {
      const next = typeof nextValue === 'function' ? nextValue(prev) : nextValue
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }

  return [value, update]
}

function CrystalIcon({ frequency = 'weekly' }: { frequency?: BossFrequency }) {
  return <img className="crystal-icon" src={`/assets/wiki/items/intense-power-crystal-${frequency}.png`} alt="" aria-hidden="true" />
}

function MesoIcon() {
  return <img className="meso-icon" src="/assets/wiki/items/meso.png" alt="" aria-hidden="true" />
}

function DragIcon() {
  return (
    <span className="drag-lines" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}
