import { Button, Typography } from '@mui/material';
import { Link } from '@tanstack/react-router';
import styles from './Page.module.scss';

export function NotFound() {
  return (
    <section className={styles.page}>
      <Typography variant="h4" component="h1">
        Page not found
      </Typography>
      <Typography>That page does not exist in the Admin panel.</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ alignSelf: 'flex-start' }}>
        Back to the start
      </Button>
    </section>
  );
}
