import { useMemo, useState } from 'react'
import { BossCrystals } from './components/BossCrystals'
import { ExpCalculator } from './components/ExpCalculator'
import { GameDataModal } from './components/GameDataModal'
import { LiberationCalculator } from './components/LiberationCalculator'
import { Shell, type AppTab } from './components/Shell'
import { SymbolsCalculator } from './components/SymbolsCalculator'
import { EXP_TABLE, DEFAULT_EXP_BUFFS } from './data/expTable'
import { DEFAULT_BOSSES, loadBosses } from './data/bosses'
import { DEFAULT_LIBERATION_STAGES, loadLiberationStages } from './data/liberation'
import { ARCANE_COST, DEFAULT_ARCANE_AREAS, DEFAULT_SACRED_AREAS, SACRED_COST, loadSymbolAreas } from './data/symbols'
import { useLocalStorage } from './hooks/useLocalStorage'
import { STORAGE_KEYS } from './lib/storage'
import type { CharacterBossState } from './types/boss'
import type { ExpBuff, ExpCharacterState } from './types/exp'
import type { CharacterLiberationState } from './types/liberation'
import type { CharacterSymbolState, SymbolArea, SymbolProgress } from './types/symbol'

export interface CharacterProfile {
  id: string
  name: string
}

const EXP_TABLE_STORAGE_KEY = 'ms_calc_exp_table_override'

const starterCharacters: CharacterProfile[] = [
  { id: 'main', name: 'Main' },
]

function createBossCharacter(profile: CharacterProfile): CharacterBossState {
  return { id: profile.id, name: profile.name, selectedBossIds: [], partySize: 1, partySizeByBossId: {}, dailyClearCountByBossId: {} }
}

function createExpCharacter(profile: CharacterProfile): ExpCharacterState {
  return {
    id: profile.id,
    name: profile.name,
    currentLevel: 260,
    currentExpPct: 0,
    baseExpPerHour: 1_000_000_000_000,
    activeBuffIds: ['coupon-2x', 'booster'],
    serverEventMultiplier: 1,
  }
}

function createProgress(area: SymbolArea): SymbolProgress {
  return {
    areaId: area.id,
    currentLevel: 1,
    currentExpSymbols: 0,
    doingDailyQuest: area.released,
    weeklyClears: area.weeklyDungeonMaxClears,
    extraDailySymbols: 0,
  }
}

function createSymbolCharacter(profile: CharacterProfile, areas: SymbolArea[]): CharacterSymbolState {
  return {
    id: profile.id,
    name: profile.name,
    progress: Object.fromEntries(areas.map((area) => [area.id, createProgress(area)])),
  }
}

function createLiberationCharacter(profile: CharacterProfile): CharacterLiberationState {
  return {
    id: profile.id,
    name: profile.name,
    currentStage: 1,
    currentTraces: 0,
    partySize: 1,
    weeklyTracesOverride: 0,
    canKillStage: {},
    mode: 'monthly',
  }
}

function readJsonOverride<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useLocalStorage<AppTab>(STORAGE_KEYS.ACTIVE_TAB, 'boss')
  const [activeCharacterId, setActiveCharacterId] = useLocalStorage('ms_calc_active_character', 'main')
  const [characters, setCharacters] = useLocalStorage<CharacterProfile[]>('ms_calc_characters', starterCharacters)
  const [bosses, setBosses] = useState(() => loadBosses())
  const [expBuffs, setExpBuffs] = useState<ExpBuff[]>(() => readJsonOverride('ms_calc_exp_buffs_override', DEFAULT_EXP_BUFFS))
  const [expTable, setExpTable] = useState<number[]>(() => readJsonOverride(EXP_TABLE_STORAGE_KEY, EXP_TABLE))
  const [symbolAreas, setSymbolAreas] = useState(() => loadSymbolAreas())
  const [liberationStages, setLiberationStages] = useState(() => loadLiberationStages())
  const [isDataOpen, setIsDataOpen] = useState(false)

  const allSymbolAreas = useMemo(
    () => [...symbolAreas.arcane, ...symbolAreas.sacred],
    [symbolAreas]
  )

  const [bossState, setBossState] = useLocalStorage<CharacterBossState[]>(
    STORAGE_KEYS.BOSS,
    starterCharacters.map(createBossCharacter)
  )
  const [expState, setExpState] = useLocalStorage<ExpCharacterState[]>(
    STORAGE_KEYS.EXP,
    starterCharacters.map(createExpCharacter)
  )
  const [symbolState, setSymbolState] = useLocalStorage<CharacterSymbolState[]>(
    STORAGE_KEYS.SYMBOLS,
    starterCharacters.map((profile) => createSymbolCharacter(profile, allSymbolAreas))
  )
  const [liberationState, setLiberationState] = useLocalStorage<CharacterLiberationState[]>(
    STORAGE_KEYS.LIBERATION,
    starterCharacters.map(createLiberationCharacter)
  )

  const activeCharacter = characters.find((character) => character.id === activeCharacterId) ?? characters[0]

  function addCharacter() {
    const nextNumber = characters.length + 1
    const profile = { id: `char-${Date.now()}`, name: `Character ${nextNumber}` }
    setCharacters((prev) => [...prev, profile])
    setBossState((prev) => [...prev, createBossCharacter(profile)])
    setExpState((prev) => [...prev, createExpCharacter(profile)])
    setSymbolState((prev) => [...prev, createSymbolCharacter(profile, allSymbolAreas)])
    setLiberationState((prev) => [...prev, createLiberationCharacter(profile)])
    setActiveCharacterId(profile.id)
  }

  function renameCharacter(characterId: string, name: string) {
    const nextName = name.trim() || 'Unnamed'
    setCharacters((prev) => prev.map((character) => character.id === characterId ? { ...character, name: nextName } : character))
    setBossState((prev) => prev.map((character) => character.id === characterId ? { ...character, name: nextName } : character))
    setExpState((prev) => prev.map((character) => character.id === characterId ? { ...character, name: nextName } : character))
    setSymbolState((prev) => prev.map((character) => character.id === characterId ? { ...character, name: nextName } : character))
    setLiberationState((prev) => prev.map((character) => character.id === characterId ? { ...character, name: nextName } : character))
  }

  function removeCharacter(characterId: string) {
    if (characters.length <= 1) return
    const remaining = characters.filter((character) => character.id !== characterId)
    setCharacters(remaining)
    setBossState((prev) => prev.filter((character) => character.id !== characterId))
    setExpState((prev) => prev.filter((character) => character.id !== characterId))
    setSymbolState((prev) => prev.filter((character) => character.id !== characterId))
    setLiberationState((prev) => prev.filter((character) => character.id !== characterId))
    if (activeCharacterId === characterId) {
      setActiveCharacterId(remaining[0]?.id ?? 'main')
    }
  }

  function reorderCharacter(characterId: string, direction: -1 | 1) {
    const index = characters.findIndex((character) => character.id === characterId)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= characters.length) return
    const nextCharacters = [...characters]
    const [moved] = nextCharacters.splice(index, 1)
    nextCharacters.splice(nextIndex, 0, moved)
    const order = new Map(nextCharacters.map((character, orderIndex) => [character.id, orderIndex]))
    setCharacters(nextCharacters)
    setBossState((prev) => [...prev].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)))
    setExpState((prev) => [...prev].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)))
    setSymbolState((prev) => [...prev].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)))
    setLiberationState((prev) => [...prev].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)))
  }

  function moveCharacter(characterId: string, targetCharacterId: string) {
    if (characterId === targetCharacterId) return
    const from = characters.findIndex((character) => character.id === characterId)
    const to = characters.findIndex((character) => character.id === targetCharacterId)
    if (from < 0 || to < 0) return
    const nextCharacters = [...characters]
    const [moved] = nextCharacters.splice(from, 1)
    nextCharacters.splice(to, 0, moved)
    const order = new Map(nextCharacters.map((character, orderIndex) => [character.id, orderIndex]))
    setCharacters(nextCharacters)
    setBossState((prev) => [...prev].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)))
    setExpState((prev) => [...prev].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)))
    setSymbolState((prev) => [...prev].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)))
    setLiberationState((prev) => [...prev].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)))
  }

  function updateGameData(nextData: GameDataSnapshot) {
    localStorage.setItem('ms_calc_bosses_override', JSON.stringify(nextData.bosses))
    localStorage.setItem('ms_calc_exp_buffs_override', JSON.stringify(nextData.expBuffs))
    localStorage.setItem(EXP_TABLE_STORAGE_KEY, JSON.stringify(nextData.expTable))
    localStorage.setItem('ms_calc_symbols_override', JSON.stringify(nextData.symbols))
    localStorage.setItem('ms_calc_liberation_override', JSON.stringify(nextData.liberationStages))
    setBosses(nextData.bosses)
    setExpBuffs(nextData.expBuffs)
    setExpTable(nextData.expTable)
    setSymbolAreas(nextData.symbols)
    setLiberationStages(nextData.liberationStages)
  }

  function resetGameData() {
    localStorage.removeItem('ms_calc_bosses_override')
    localStorage.removeItem('ms_calc_exp_buffs_override')
    localStorage.removeItem(EXP_TABLE_STORAGE_KEY)
    localStorage.removeItem('ms_calc_symbols_override')
    localStorage.removeItem('ms_calc_liberation_override')
    setBosses(DEFAULT_BOSSES)
    setExpBuffs(DEFAULT_EXP_BUFFS)
    setExpTable(EXP_TABLE)
    setSymbolAreas({ arcane: DEFAULT_ARCANE_AREAS, sacred: DEFAULT_SACRED_AREAS })
    setLiberationStages(DEFAULT_LIBERATION_STAGES)
  }

  const gameData: GameDataSnapshot = {
    bosses,
    expBuffs,
    expTable,
    symbols: symbolAreas,
    symbolCosts: { arcane: ARCANE_COST, sacred: SACRED_COST },
    liberationStages,
  }

  return (
    <Shell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      characters={characters}
      activeCharacterId={activeCharacter?.id ?? 'main'}
      onCharacterChange={setActiveCharacterId}
      onAddCharacter={addCharacter}
      onRenameCharacter={renameCharacter}
      onOpenGameData={() => setIsDataOpen(true)}
    >
      {activeTab === 'boss' ? (
        <BossCrystals
          bosses={bosses}
          characters={characters}
          bossState={bossState}
          activeCharacterId={activeCharacter?.id ?? 'main'}
          onStateChange={setBossState}
          onCharacterChange={setActiveCharacterId}
          onRenameCharacter={renameCharacter}
          onRemoveCharacter={removeCharacter}
          onMoveCharacter={moveCharacter}
        />
      ) : null}
      {activeTab === 'exp' ? (
        <ExpCalculator
          buffs={expBuffs}
          expTable={expTable}
          characters={characters}
          expState={expState}
          activeCharacterId={activeCharacter?.id ?? 'main'}
          onStateChange={setExpState}
        />
      ) : null}
      {activeTab === 'symbols' ? (
        <SymbolsCalculator
          areas={symbolAreas}
          costTables={{ arcane: ARCANE_COST, sacred: SACRED_COST }}
          characters={characters}
          symbolState={symbolState}
          activeCharacterId={activeCharacter?.id ?? 'main'}
          onStateChange={setSymbolState}
        />
      ) : null}
      {activeTab === 'liberation' ? (
        <LiberationCalculator
          stages={liberationStages}
          characters={characters}
          liberationState={liberationState}
          activeCharacterId={activeCharacter?.id ?? 'main'}
          onStateChange={setLiberationState}
        />
      ) : null}
      <GameDataModal
        data={gameData}
        open={isDataOpen}
        onClose={() => setIsDataOpen(false)}
        onSave={updateGameData}
        onReset={resetGameData}
      />
    </Shell>
  )
}

export interface GameDataSnapshot {
  bosses: typeof DEFAULT_BOSSES
  expBuffs: ExpBuff[]
  expTable: number[]
  symbols: { arcane: SymbolArea[]; sacred: SymbolArea[] }
  symbolCosts: { arcane: number[]; sacred: number[] }
  liberationStages: typeof DEFAULT_LIBERATION_STAGES
}
