import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router';
import type { RouterHistory } from '@tanstack/react-router';
import { RequirePermission } from './access/permissions';
import { SECTIONS, type Section } from './access/sections';
import { SignInPage } from './auth/SignInPage';
import { contactsListSearch } from './resources/contacts';
import { Account } from './routes/Account';
import { Home } from './routes/Home';
import { NotFound } from './routes/NotFound';
import { RootLayout } from './routes/RootLayout';
import { SectionPlaceholder } from './routes/SectionPlaceholder';

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

/** A section's screen, shown only to Operators whose Permissions open it. */
function sectionRoute<P extends string>(section: Section & { path: P }) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: section.path,
    component: () => (
      <RequirePermission anyOf={section.anyOf}>
        <SectionPlaceholder title={section.label} />
      </RequirePermission>
    ),
  });
}

// The data grid is large, so a list screen is only downloaded when the Operator opens it.
const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: SECTIONS.contacts.path,
  validateSearch: contactsListSearch.validate,
  component: lazyRouteComponent(() => import('./resources/ContactsScreen'), 'ContactsScreen'),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  accountRoute,
  signInRoute,
  sectionRoute(SECTIONS.blogs),
  sectionRoute(SECTIONS.projects),
  sectionRoute(SECTIONS.profiles),
  sectionRoute(SECTIONS.assets),
  contactsRoute,
  sectionRoute(SECTIONS.slots),
  sectionRoute(SECTIONS.operators),
  sectionRoute(SECTIONS.roles),
]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, basepath: '/admin', history });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
