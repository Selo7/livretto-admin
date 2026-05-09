'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

type Status = 'lead' | 'trial' | 'paying' | 'churned'

interface Entry {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: Status
  notes: string | null
  created_at: string
}

const STATUS_OPT: { value: Status; label: string; color: string }[] = [
  { value: 'lead',    label: 'Lead',    color: 'bg-blue-500/15 text-blue-300' },
  { value: 'trial',   label: 'Trial',   color: 'bg-yellow-500/15 text-yellow-300' },
  { value: 'paying',  label: 'Pagando', color: 'bg-green-500/15 text-green-300' },
  { value: 'churned', label: 'Churn',   color: 'bg-red-500/15 text-red-300' },
]

const EMPTY = { name: '', email: '', phone: '', status: 'lead' as Status, notes: '' }

export default function CrmPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load(s = filter) {
    const res = await fetch(`/api/crm?status=${s}`)
    if (res.ok) setEntries(await res.json())
  }

  useEffect(() => { load() }, [filter])

  function startEdit(e: Entry) {
    setEditId(e.id)
    setForm({ name: e.name, email: e.email ?? '', phone: e.phone ?? '', status: e.status, notes: e.notes ?? '' })
  }

  async function save() {
    setSaving(true)
    if (editId) {
      await fetch('/api/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form }),
      })
      setEditId(null)
    } else {
      await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setAdding(false)
    }
    setForm(EMPTY)
    setSaving(false)
    load()
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remover ${name}?`)) return
    await fetch('/api/crm', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar username="—" />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">CRM</h1>
          <button
            onClick={() => { setAdding(true); setEditId(null); setForm(EMPTY) }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={15} /> Adicionar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {[{ value: 'all', label: 'Todos' }, ...STATUS_OPT].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {'label' in opt ? opt.label : opt.value}
            </button>
          ))}
        </div>

        {/* Formulário inline para adicionar */}
        {adding && (
          <EntryForm
            form={form}
            setForm={setForm}
            onSave={save}
            onCancel={() => setAdding(false)}
            saving={saving}
          />
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Telefone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Notas</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Data</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500 text-xs">Nenhuma entrada</td></tr>
              )}
              {entries.map(e => (
                editId === e.id ? (
                  <tr key={e.id} className="border-b border-gray-800 bg-gray-800/50">
                    <td colSpan={7} className="px-5 py-4">
                      <EntryForm
                        form={form}
                        setForm={setForm}
                        onSave={save}
                        onCancel={() => setEditId(null)}
                        saving={saving}
                        inline
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{e.name}</td>
                    <td className="px-5 py-3 text-gray-400">{e.email ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-400">{e.phone ?? '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs max-w-[200px] truncate">{e.notes ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(e.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => startEdit(e)} className="text-gray-500 hover:text-indigo-400 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => remove(e.id, e.name)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const opt = STATUS_OPT.find(o => o.value === status)
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt?.color ?? ''}`}>
      {opt?.label ?? status}
    </span>
  )
}

function EntryForm({
  form, setForm, onSave, onCancel, saving, inline = false
}: {
  form: typeof EMPTY
  setForm: (f: typeof EMPTY) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  inline?: boolean
}) {
  const cls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 w-full'
  const wrap = inline ? 'flex flex-wrap gap-3 items-end' : 'bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4 grid grid-cols-3 gap-3'

  return (
    <div className={wrap}>
      <input placeholder="Nome *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={cls} />
      <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={cls} />
      <input placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={cls} />
      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}
        className={cls}>
        {STATUS_OPT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input placeholder="Notas" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={cls} />
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving || !form.name.trim()}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition-colors">
          <Check size={14} /> {saving ? '...' : 'Salvar'}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg text-sm transition-colors border border-gray-700">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}
