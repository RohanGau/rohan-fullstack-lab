import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import type { RouterHistory } from '@tanstack/react-router';
import { SignInPage } from './auth/SignInPage';
import { Account } from './routes/Account';
import { Home } from './routes/Home';
import { NotFound } from './routes/NotFound';
import { RootLayout } from './routes/RootLayout';

const rootRoute = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: Account,
});
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
  component: function SignInRoute() {
    const { redirect } = signInRoute.useSearch();
    return <SignInPage redirect={redirect} />;
  },
});
const routeTree = rootRoute.addChildren([homeRoute, accountRoute, signInRoute]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, basepath: '/admin', history });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
