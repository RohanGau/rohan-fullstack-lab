import { Alert, Snackbar } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface NoticeContextValue {
  /** Tells the Operator something that is not tied to one screen, e.g. a refused request. */
  showNotice(message: string): void;
}

const NoticeContext = createContext<NoticeContextValue | null>(null);

/** One place, for the whole panel, where such messages appear. */
export function NoticeProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const showNotice = useCallback((next: string) => setMessage(next), []);
  const value = useMemo(() => ({ showNotice }), [showNotice]);

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <Snackbar
        open={message !== null}
        onClose={(_event, reason) => {
          if (reason !== 'clickaway') setMessage(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setMessage(null)}>
          {message}
        </Alert>
      </Snackbar>
    </NoticeContext.Provider>
  );
}

export function useNotice(): NoticeContextValue {
  const context = useContext(NoticeContext);
  if (!context) throw new Error('useNotice must be used inside NoticeProvider');
  return context;
}
