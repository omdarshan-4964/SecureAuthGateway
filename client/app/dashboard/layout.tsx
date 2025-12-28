/**
 * DASHBOARD LAYOUT
 * Protected dashboard with sidebar navigation
 */

'use client';

import { useState } from 'react';
import { RequireAuth } from '@/components/auth/require-auth';
import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}
