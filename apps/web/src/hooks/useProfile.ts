import { useEffect, useState } from 'react';
import { useProfileStore } from '@/lib/store';
import { apiFetch } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import { IProfileDto } from '@fullstack-lab/types';

export function useProfile() {
  const { profile, setProfile } = useProfileStore();
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      apiFetch<IProfileDto[]>(API.PROFILE)
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
