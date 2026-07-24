import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-svh bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <DashboardHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
