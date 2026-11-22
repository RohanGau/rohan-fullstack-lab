import { Typography } from '@mui/material';
import styles from './Page.module.scss';

/** Stands in for a section until it moves over from the old admin. */
export function SectionPlaceholder({ title }: { title: string }) {
  return (
    <section className={styles.page}>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      <Typography color="text.secondary">
        This section has not moved to the new Admin panel yet.
      </Typography>
    </section>
  );
}
