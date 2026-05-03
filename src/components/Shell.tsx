import type { ReactNode } from 'react'
import type { CharacterProfile } from '../App'
import { Button, TextInput } from './ui'

export type AppTab = 'boss' | 'exp' | 'symbols' | 'liberation'

const tabs: Array<{ id: AppTab; label: string; meta: string }> = [
  { id: 'boss', label: 'Boss Crystals', meta: 'Meso cap' },
  { id: 'exp', label: 'EXP', meta: 'Session + progress' },
  { id: 'symbols', label: 'Symbols', meta: 'Arcane + Sacred' },
  { id: 'liberation', label: 'Liberation', meta: 'AFL traces' },
]

export function Shell({
  children,
  activeTab,
  onTabChange,
  characters,
  activeCharacterId,
  onCharacterChange,
  onAddCharacter,
  onRenameCharacter,
  onOpenGameData,
}: {
  children: ReactNode
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  characters: CharacterProfile[]
  activeCharacterId: string
  onCharacterChange: (id: string) => void
  onAddCharacter: () => void
  onRenameCharacter: (id: string, name: string) => void
  onOpenGameData: () => void
}) {
  const activeCharacter = characters.find((character) => character.id === activeCharacterId) ?? characters[0]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">MS</div>
          <div>
            <h1>MapleStory Calculators</h1>
            <p>GMS Reboot / Heroic local planner</p>
          </div>
        </div>
        <Button variant="secondary" onClick={onOpenGameData}>
          <span aria-hidden="true">Data</span>
          <span className="btn-icon" aria-hidden="true">Edit</span>
        </Button>
      </header>

      <nav className="tabbar" aria-label="Calculator sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            type="button"
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.label}</span>
            <small>{tab.meta}</small>
          </button>
        ))}
      </nav>

      <section className="character-strip" aria-label="Characters">
        <div className="character-buttons">
          {characters.map((character) => (
            <button
              key={character.id}
              className={`character-tab ${character.id === activeCharacterId ? 'character-tab-active' : ''}`}
              type="button"
              onClick={() => onCharacterChange(character.id)}
            >
              {character.name}
            </button>
          ))}
          <Button variant="ghost" onClick={onAddCharacter}>+ Character</Button>
        </div>
        {activeCharacter ? (
          <TextInput
            aria-label="Rename active character"
            className="rename-input"
            value={activeCharacter.name}
            onChange={(event) => onRenameCharacter(activeCharacter.id, event.target.value)}
          />
        ) : null}
      </section>

      <main className="content-shell">{children}</main>
    </div>
  )
}
