import { useEffect, useState } from 'react';
import { useProfileStore } from '@/lib/store';

export function useProfile() {
  const { profile, setProfile } = useProfileStore();
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
        console.log('Fetching profile data...');
      fetch('https://rohan-backend-api.fly.dev/api/profiles')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          return res.json();
        })  
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
