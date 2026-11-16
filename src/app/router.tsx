import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ApprovalsPage } from '@/features/approvals/ApprovalsPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ClansPage } from '@/features/clans/ClansPage'
import { EventsPage } from '@/features/events/EventsPage'
import { ExportPage } from '@/features/export/ExportPage'
import { HistoryPage } from '@/features/history/HistoryPage'
import { ImportPage } from '@/features/import/ImportPage'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'
import { PersonProfilePage } from '@/features/persons/PersonProfilePage'
import { F3PersonProfilePage } from '@/features/f3/PersonProfilePage'
import { PersonsPage } from '@/features/persons/PersonsPage'
import { PublicClansPage } from '@/features/public/PublicClansPage'
import { PublicTreePage } from '@/features/public/PublicTreePage'
import { RolesPage } from '@/features/roles/RolesPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TreePage } from '@/features/tree/TreePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/public',
    element: <PublicClansPage />,
  },
  {
    path: '/public/:clanId',
    element: <PublicTreePage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/clans" replace /> },
      { path: 'clans', element: <ClansPage /> },
      { path: 'clans/:clanId/persons/:personId', element: <F3PersonProfilePage /> },
      { path: 'persons', element: <PersonsPage /> },
      { path: 'persons/:personId', element: <PersonProfilePage /> },
      { path: 'tree', element: <TreePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'import', element: <ImportPage /> },
      { path: 'export', element: <ExportPage /> },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'roles', element: <RolesPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
