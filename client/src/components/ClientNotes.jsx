import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { StickyNote, Plus, Trash2, Loader2 } from 'lucide-react'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ClientNotes({ clientId, mockNotes = [] }) {
  const { getAccessTokenSilently } = useAuth0()
  const [notes, setNotes] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isMock) { setNotes(mockNotes); setLoading(false); return }
    async function load() {
      try {
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        const { data } = await api.get(`/api/clients/${clientId}/notes`)
        setNotes(data || [])
      } catch {
        setError('Could not load notes')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clientId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!draft.trim()) return
    if (isMock) {
      setNotes(prev => [{ id: Date.now(), content: draft, created_at: new Date().toISOString() }, ...prev])
      setDraft('')
      return
    }
    setSaving(true)
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.post(`/api/clients/${clientId}/notes`, { content: draft })
      setNotes(prev => [data, ...prev])
      setDraft('')
      setError(null)
    } catch {
      setError('Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(noteId) {
    if (isMock) { setNotes(prev => prev.filter(n => n.id !== noteId)); return }
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      await api.delete(`/api/clients/${clientId}/notes/${noteId}`)
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch {
      setError('Failed to delete note')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <StickyNote className="w-4 h-4 text-[hsl(var(--primary))]" />
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Case Notes</span>
        <span className="ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Add note form */}
      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd(e) }}
          placeholder="Add a case note… (⌘↵ to save)"
          rows={3}
          className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] resize-none"
        />
        <div className="flex items-center justify-between">
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={saving || !draft.trim()}
            className="ml-auto flex items-center gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition-all hover:glow-amber"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            {saving ? 'Saving…' : 'Add Note'}
          </button>
        </div>
      </form>

      {/* Notes list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {loading && (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-14 rounded-lg bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
          </div>
        )}
        {!loading && notes.length === 0 && (
          <p className="text-center text-[hsl(var(--muted-foreground))] text-xs italic py-4">No notes yet. Add one above.</p>
        )}
        {notes.map(note => (
          <div key={note.id} className="group relative bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg px-3 py-2.5">
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed pr-6 whitespace-pre-wrap">{note.content}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{timeAgo(note.created_at)}</span>
              {note.caseworkers?.name && (
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">· {note.caseworkers.name}</span>
              )}
            </div>
            <button
              onClick={() => handleDelete(note.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
