import { List, ListItem, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import { Link } from '@tanstack/react-router';
import { SECTION_GROUPS, SECTION_LIST } from '../access/sections';
import { useCan } from '../access/permissions';
import styles from './Shell.module.scss';

/** Only the sections this Operator's Permissions open. */
export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const can = useCan();
  const visible = SECTION_LIST.filter((section) => can(section.anyOf));

  return (
    <nav aria-label="Main" className={styles.nav}>
      <List dense>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/" onClick={onNavigate}>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </ListItem>
        {SECTION_GROUPS.map((group) => {
          const sections = visible.filter((section) => section.group === group);
          if (sections.length === 0) return null;
          return (
            <ListItem key={group} disablePadding className={styles.group}>
              <ListSubheader component="div" disableSticky id={`nav-group-${group}`}>
                {group}
              </ListSubheader>
              <List dense disablePadding aria-labelledby={`nav-group-${group}`}>
                {sections.map((section) => (
                  <ListItem key={section.path} disablePadding>
                    <ListItemButton component={Link} to={section.path} onClick={onNavigate}>
                      <ListItemText primary={section.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </ListItem>
          );
        })}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/account" onClick={onNavigate}>
            <ListItemText primary="Account" />
          </ListItemButton>
        </ListItem>
      </List>
    </nav>
  );
}
