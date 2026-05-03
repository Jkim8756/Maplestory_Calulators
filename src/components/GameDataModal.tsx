import { useEffect, useMemo, useState } from 'react'
import type { GameDataSnapshot } from '../App'
import { Button, Panel } from './ui'

export function GameDataModal({
  data,
  open,
  onClose,
  onSave,
  onReset,
}: {
  data: GameDataSnapshot
  open: boolean
  onClose: () => void
  onSave: (data: GameDataSnapshot) => void
  onReset: () => void
}) {
  const serialized = useMemo(() => JSON.stringify(data, null, 2), [data])
  const [draft, setDraft] = useState(serialized)
  const [message, setMessage] = useState('Edit JSON locally. Save writes browser localStorage overrides.')

  useEffect(() => {
    if (open) {
      setDraft(serialized)
      setMessage('Edit JSON locally. Save writes browser localStorage overrides.')
    }
  }, [open, serialized])

  if (!open) return null

  function saveDraft() {
    try {
      const parsed = JSON.parse(draft) as GameDataSnapshot
      validateData(parsed)
      onSave(parsed)
      setMessage('Saved overrides. Calculators are using this data now.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Invalid JSON.')
    }
  }

  async function exportDraft() {
    try {
      await navigator.clipboard.writeText(draft)
      setMessage('Copied JSON to clipboard.')
    } catch {
      setMessage('Clipboard unavailable. Select the JSON text to export manually.')
    }
  }

  function resetDefaults() {
    onReset()
    setMessage('Reset to defaults. Close and reopen to review the default JSON.')
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="game-data-title">
      <Panel className="modal-panel">
        <div className="modal-head">
          <div>
            <p className="section-kicker">Local JSON overrides</p>
            <h2 id="game-data-title">Game Data Editor</h2>
            <p>Boss values, EXP buffs/table, symbol areas, and liberation stages.</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <textarea
          className="json-editor"
          spellCheck={false}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="modal-actions">
          <span className="editor-message">{message}</span>
          <div className="action-row">
            <Button variant="secondary" onClick={exportDraft}>Export</Button>
            <Button variant="secondary" onClick={() => setDraft(serialized)}>Import Current</Button>
            <Button variant="danger" onClick={resetDefaults}>Reset Defaults</Button>
            <Button onClick={saveDraft}>Save JSON</Button>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function validateData(data: GameDataSnapshot) {
  if (!Array.isArray(data.bosses)) throw new Error('Invalid data: bosses must be an array.')
  if (!Array.isArray(data.expBuffs)) throw new Error('Invalid data: expBuffs must be an array.')
  if (!Array.isArray(data.expTable)) throw new Error('Invalid data: expTable must be an array.')
  if (!Array.isArray(data.symbols?.arcane) || !Array.isArray(data.symbols?.sacred)) {
    throw new Error('Invalid data: symbols.arcane and symbols.sacred must be arrays.')
  }
  if (!Array.isArray(data.liberationStages)) throw new Error('Invalid data: liberationStages must be an array.')
}
