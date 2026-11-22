import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material';
import { Link } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthProvider';
import styles from './Header.module.scss';

export function Header({ onOpenNavigation }: { onOpenNavigation?: () => void }) {
  const { state, signOut } = useAuth();
  if (state.status !== 'signedIn') return null;

  return (
    <AppBar position="static" color="default" elevation={0} className={styles.bar}>
      <Toolbar className={styles.toolbar}>
        {onOpenNavigation && (
          <IconButton edge="start" aria-label="Open navigation" onClick={onOpenNavigation}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography component={Link} to="/" variant="h6" className={styles.title}>
          Admin panel
        </Typography>
        <div className={styles.spacer} />
        <Typography variant="body2">{state.operator.email ?? state.operator.id}</Typography>
        <Button onClick={() => void signOut()}>Sign out</Button>
      </Toolbar>
    </AppBar>
  );
}
