'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Plus, Pencil, Trash2, X, Check, ArrowLeft } from 'lucide-react'

interface Doc { id: string; title: string; content: string; updated_at: string; updated_by: string }

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [editing, setEditing] = useState<Doc | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/docs')
    if (res.ok) setDocs(await res.json())
  }
  useEffect(() => { load() }, [])

  function openEdit(d: Doc) { setEditing(d); setTitle(d.title); setContent(d.content); setCreating(false) }
  function openCreate() { setEditing(null); setTitle(''); setContent(''); setCreating(true) }
  function back() { setEditing(null); setCreating(false) }

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch('/api/docs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, title, content }),
      })
    } else {
      await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
    }
    setSaving(false)
    back()
    load()
  }

  async function remove(id: string, t: string) {
    if (!confirm(`Remover "${t}"?`)) return
    await fetch('/api/docs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  if (editing || creating) {
    return (
      <div className="flex min-h-screen">
        <Sidebar username="—" />
        <main className="flex-1 p-8 flex flex-col">
          <button onClick={back} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-100 text-sm mb-5 transition-colors w-fit">
            <ArrowLeft size={15} /> Voltar
          </button>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título do documento"
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-lg font-semibold focus:outline-none focus:border-indigo-500 mb-4"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Conteúdo (markdown ou texto)..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500 resize-none min-h-[400px]"
          />
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={saving || !title.trim()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Check size={14} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={back} className="flex items-center gap-1.5 text-gray-400 border border-gray-700 px-4 py-2 rounded-lg text-sm transition-colors hover:text-gray-200">
              <X size={14} /> Cancelar
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar username="—" />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Documentação</h1>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> Novo documento
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Atualizado</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Por</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-500 text-xs">Nenhum documento</td></tr>
              )}
              {docs.map(d => (
                <tr key={d.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{d.title}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(d.updated_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{d.updated_by}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(d)} className="text-gray-500 hover:text-indigo-400 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => remove(d.id, d.title)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
