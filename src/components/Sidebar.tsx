'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, Briefcase } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/crm',       label: 'CRM',           icon: Briefcase },
  { href: '/users',     label: 'Usuários',      icon: Users },
  { href: '/docs',      label: 'Documentação',  icon: BookOpen },
]

export function Sidebar({ username }: { username: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="font-bold text-white tracking-tight text-lg">Livretto</span>
        <span className="ml-1.5 text-xs text-indigo-400 font-medium uppercase tracking-widest">admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 px-3 mb-2">{username}</p>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
