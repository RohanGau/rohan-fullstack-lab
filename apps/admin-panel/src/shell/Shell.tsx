import { Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import styles from './Shell.module.scss';

/** What a signed-in Operator sees around every page: header, navigation, page content. */
export function Shell() {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const content = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firstPage = useRef(true);

  // After navigating, keyboard and screen reader users start at the new page, not at the link they pressed.
  useEffect(() => {
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    content.current?.focus();
  }, [pathname]);

  return (
    <>
      <a
        className={styles.skip}
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          content.current?.focus();
        }}
      >
        Skip to main content
      </a>
      <Header onOpenNavigation={wide ? undefined : () => setMenuOpen(true)} />
      <div className={wide ? styles.body : styles.bodyNarrow}>
        {wide ? (
          <aside className={styles.sidebar}>
            <Navigation />
          </aside>
        ) : (
          <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
            <Navigation onNavigate={() => setMenuOpen(false)} />
          </Drawer>
        )}
        <main id="main-content" tabIndex={-1} ref={content} className={styles.content}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
