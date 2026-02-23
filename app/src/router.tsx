import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { getCurrentUser, getCurrentStaff } from './lib/auth'
import { AppLayout } from './components/layout/AppLayout'
import LoginPage from './routes/login'
import SchedulePage from './routes/schedule'
import PatientsPage from './routes/patients'
import PatientDetailsPage from './routes/patient-details'
import AvailabilityPage from './routes/availability'
import SettingsPage from './routes/settings'
import AccountPage from './routes/account'

// Root route — no auth check, just renders outlet
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Login — accessible without auth, redirect away if already logged in
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) {
      throw redirect({ to: '/schedule' })
    }
  },
  component: LoginPage,
})

// Authenticated layout — auth guard + AppLayout wrapper
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

// App pages (children of authenticated layout)
const scheduleRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/schedule',
  component: SchedulePage,
})

const patientsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/patients',
  component: PatientsPage,
})

const patientDetailsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/patients/$patientId',
  component: PatientDetailsPage,
})

const availabilityRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/availability',
  component: AvailabilityPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  beforeLoad: async () => {
    const staff = await getCurrentStaff()
    if (staff?.role !== 'admin') {
      throw redirect({ to: '/schedule' })
    }
  },
  component: SettingsPage,
})

const accountRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/account',
  component: AccountPage,
})

// Index redirect → /schedule
const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/schedule' })
  },
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    indexRoute,
    scheduleRoute,
    patientsRoute,
    patientDetailsRoute,
    availabilityRoute,
    settingsRoute,
    accountRoute,
  ]),
])

export const router = createRouter({ routeTree })
