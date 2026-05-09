'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Plus, Trash2, RefreshCw, UserCheck, UserX } from 'lucide-react'

interface AdminUser {
  id: string
  username: string
  created_by: string
  created_at: string
  password_hash?: string | null
}

// Layout com sidebar — precisa de username do cookie via header
// Usamos uma Server Component wrapper via layout.tsx se necessário,
// mas aqui simplificamos com um state de carregamento
export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState('')
  const [novoUsername, setNovoUsername] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  // Descobre o username atual pelo dashboard redirect (simplificado)
  useEffect(() => {
    load()
    // Tenta ler o username do meta tag injetado pelo layout (veja layout abaixo)
    const meta = document.querySelector('meta[name="admin-user"]')
    if (meta) setMe(meta.getAttribute('content') ?? '')
  }, [])

  async function criar() {
    if (!novoUsername.trim()) return
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: novoUsername.trim() }),
    })
    const data = await res.json()
    if (res.ok) { setNovoUsername(''); setMsg('Usuário criado!'); load() }
    else setMsg(data.error)
    setTimeout(() => setMsg(''), 3000)
  }

  async function remover(id: string, username: string) {
    if (!confirm(`Remover ${username}?`)) return
    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, username }),
    })
    const data = await res.json()
    if (res.ok) load()
    else setMsg(data.error)
    setTimeout(() => setMsg(''), 3000)
  }

  async function resetarSenha(id: string) {
    if (!confirm('Resetar senha deste usuário? Ele precisará definir uma nova no próximo acesso.')) return
    await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setMsg('Senha resetada')
    setTimeout(() => setMsg(''), 3000)
  }

  const isMaster = me === 'brunomassa' || users.find(u => u.username === 'brunomassa') !== undefined

  return (
    <div className="flex min-h-screen">
      <Sidebar username={me || '—'} />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Usuários Admin</h1>
          <button onClick={load} className="text-gray-400 hover:text-gray-100 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Criar usuário */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <p className="text-sm font-medium mb-3">Novo usuário</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={novoUsername}
              onChange={e => setNovoUsername(e.target.value)}
              placeholder="username"
              onKeyDown={e => e.key === 'Enter' && criar()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={criar}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              Criar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">O usuário definirá a senha no primeiro acesso.</p>
          {msg && <p className="text-xs text-indigo-400 mt-2">{msg}</p>}
        </div>

        {/* Tabela */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Usuário</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Criado por</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Senha</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Criado em</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-xs">Carregando...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{u.username}</td>
                  <td className="px-5 py-3 text-gray-400">{u.created_by}</td>
                  <td className="px-5 py-3">
                    {u.password_hash
                      ? <span className="flex items-center gap-1 text-green-400 text-xs"><UserCheck size={12}/> Definida</span>
                      : <span className="flex items-center gap-1 text-yellow-400 text-xs"><UserX size={12}/> Primeiro acesso</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {u.username !== 'brunomassa' && (
                        <>
                          <button
                            onClick={() => resetarSenha(u.id)}
                            className="text-gray-500 hover:text-yellow-400 transition-colors"
                            title="Resetar senha"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => remover(u.id, u.username)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
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
