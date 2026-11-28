import { cache } from 'react';
import type { IProfileDto } from '@fullstack-lab/types';
import { apiFetch } from '../apiClient';
import { API } from '../constant';

export async function getProfiles(signal?: AbortSignal): Promise<IProfileDto[]> {
  return apiFetch<IProfileDto[]>(API.PROFILE, { signal });
}

export const getProfilesCached = cache(getProfiles);

export function pickHomeProfile(profiles: IProfileDto[] | null | undefined): IProfileDto | null {
  if (!profiles?.length) return null;
  return (
    profiles.find(
      (item) => Array.isArray(item?.architectureAreas) && item.architectureAreas.length > 0
    ) ?? profiles[0]
  );
}

export function pickAboutProfile(profiles: IProfileDto[] | null | undefined): IProfileDto | null {
  if (!profiles?.length) return null;
  return profiles.find((item) => item.id !== '688a63c9e76b322b8c0b5814') ?? profiles[0];
}
