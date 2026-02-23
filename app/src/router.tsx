import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect
} from '@tanstack/react-router'

import { getCurrentUser } from './lib/auth'
import LoginPage from './routes/login'
import SchedulePage from './routes/schedule'

const rootRoute = createRootRoute({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser()
    if (!user && location.pathname !== '/login') {
      throw redirect({ to: '/login' })
    }
  },
  component: () => <Outlet />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  component: SchedulePage,
})

const routeTree = rootRoute.addChildren([loginRoute, scheduleRoute])

export const router = createRouter({ routeTree })