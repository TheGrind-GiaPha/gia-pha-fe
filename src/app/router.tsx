import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ApprovalsPage } from '@/features/approvals/ApprovalsPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ClansPage } from '@/features/clans/ClansPage'
import { EventsPage } from '@/features/events/EventsPage'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'
import { PersonsPage } from '@/features/persons/PersonsPage'
import { PublicClansPage } from '@/features/public/PublicClansPage'
import { PublicTreePage } from '@/features/public/PublicTreePage'
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
      { path: 'persons', element: <PersonsPage /> },
      { path: 'tree', element: <TreePage /> },
      { path: 'approvals', element: <ApprovalsPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
