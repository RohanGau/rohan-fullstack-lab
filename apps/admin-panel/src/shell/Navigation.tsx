import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import EventAvailableOutlined from '@mui/icons-material/EventAvailableOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';
import WorkOutline from '@mui/icons-material/WorkOutline';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { SECTION_GROUPS, SECTION_LIST, SECTIONS } from '../access/sections';
import { useCan } from '../access/permissions';
import styles from './Shell.module.scss';

const SECTION_ICONS: Record<string, ReactNode> = {
  [SECTIONS.blogs.path]: <ArticleOutlined fontSize="small" aria-hidden="true" />,
  [SECTIONS.projects.path]: <WorkOutline fontSize="small" aria-hidden="true" />,
  [SECTIONS.profiles.path]: <BadgeOutlined fontSize="small" aria-hidden="true" />,
  [SECTIONS.assets.path]: <CloudUploadOutlined fontSize="small" aria-hidden="true" />,
  [SECTIONS.contacts.path]: <MailOutline fontSize="small" aria-hidden="true" />,
  [SECTIONS.slots.path]: <EventAvailableOutlined fontSize="small" aria-hidden="true" />,
  [SECTIONS.operators.path]: <GroupOutlined fontSize="small" aria-hidden="true" />,
  [SECTIONS.roles.path]: <SecurityOutlined fontSize="small" aria-hidden="true" />,
};

function isRouteActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/' || pathname === '';
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** Only the sections this Operator's Permissions open. */
export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const can = useCan();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const visible = SECTION_LIST.filter((section) => can(section.anyOf));

  return (
    <nav aria-label="Main" className={styles.nav}>
      <List dense disablePadding>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/"
            onClick={onNavigate}
            selected={isRouteActive(pathname, '/')}
            aria-current={isRouteActive(pathname, '/') ? 'page' : undefined}
            className={styles.navLink}
          >
            <ListItemIcon className={styles.navIcon}>
              <DashboardOutlined fontSize="small" aria-hidden="true" />
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </ListItem>

        {SECTION_GROUPS.map((group) => {
          const sections = visible.filter((section) => section.group === group);
          if (sections.length === 0) return null;
          return (
            <li key={group} className={styles.navGroup}>
              <div id={`nav-group-${group}`} className={styles.groupHeader}>
                {group}
              </div>
              <List dense disablePadding aria-labelledby={`nav-group-${group}`}>
                {sections.map((section) => {
                  const active = isRouteActive(pathname, section.path);
                  return (
                    <ListItem key={section.path} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={section.path}
                        onClick={onNavigate}
                        selected={active}
                        aria-current={active ? 'page' : undefined}
                        className={styles.navLink}
                      >
                        <ListItemIcon className={styles.navIcon}>
                          {SECTION_ICONS[section.path]}
                        </ListItemIcon>
                        <ListItemText primary={section.label} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </li>
          );
        })}

        <ListItem disablePadding className={styles.navDivider}>
          <ListItemButton
            component={Link}
            to="/account"
            onClick={onNavigate}
            selected={isRouteActive(pathname, '/account')}
            aria-current={isRouteActive(pathname, '/account') ? 'page' : undefined}
            className={styles.navLink}
          >
            <ListItemIcon className={styles.navIcon}>
              <AccountCircleOutlined fontSize="small" aria-hidden="true" />
            </ListItemIcon>
            <ListItemText primary="Account" />
          </ListItemButton>
        </ListItem>
      </List>
    </nav>
  );
}
