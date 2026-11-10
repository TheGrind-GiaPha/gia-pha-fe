import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ApprovalsPage } from '@/features/approvals/ApprovalsPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ClansPage } from '@/features/clans/ClansPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { EventsPage } from '@/features/events/EventsPage'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'
import { PersonsPage } from '@/features/persons/PersonsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TreePage } from '@/features/tree/TreePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
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
