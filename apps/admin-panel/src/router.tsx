import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import type { RouterHistory } from '@tanstack/react-router';
import { Home } from './routes/Home';
import { NotFound } from './routes/NotFound';

const rootRoute = createRootRoute({ component: Outlet, notFoundComponent: NotFound });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const routeTree = rootRoute.addChildren([homeRoute]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, basepath: '/admin', history });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
