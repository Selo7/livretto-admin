import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { Sidebar } from '@/components/Sidebar'
import { Users, Briefcase, BookOpen } from 'lucide-react'

async function getStats() {
  const client = db()
  const [{ count: users }, { count: crm }, { count: docs }] = await Promise.all([
    client.from('admin_users').select('*', { count: 'exact', head: true }),
    client.from('admin_crm').select('*', { count: 'exact', head: true }),
    client.from('admin_docs').select('*', { count: 'exact', head: true }),
  ])
  return { users: users ?? 0, crm: crm ?? 0, docs: docs ?? 0 }
}

async function getCrmByStatus() {
  const { data } = await db().from('admin_crm').select('status')
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }
  return counts
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = token ? await verifyToken(token) : null
  if (!session) redirect('/login')

  const [stats, statusCounts] = await Promise.all([getStats(), getCrmByStatus()])

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    lead:    { label: 'Leads',    color: 'text-blue-400' },
    trial:   { label: 'Trial',   color: 'text-yellow-400' },
    paying:  { label: 'Pagando', color: 'text-green-400' },
    churned: { label: 'Churn',   color: 'text-red-400' },
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar username={session.username} />
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-6">Dashboard</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Usuários admin', value: stats.users, icon: Users, color: 'text-indigo-400' },
            { label: 'Entradas CRM',   value: stats.crm,   icon: Briefcase, color: 'text-emerald-400' },
            { label: 'Documentos',     value: stats.docs,  icon: BookOpen,  color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon size={18} className={color} />
                <span className="text-sm text-gray-400">{label}</span>
              </div>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4">CRM por status</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
              <div key={key}>
                <p className={`text-2xl font-bold ${color}`}>{statusCounts[key] ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
