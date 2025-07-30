import { useEffect, useState } from 'react';
import { useProfileStore } from '@/lib/store';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';

export function useProfile() {
  const { profile, setProfile } = useProfileStore();
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiFetch<any[]>(API.PROFILE)
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [profile, setProfile]);

  return { profile, loading, error };
}