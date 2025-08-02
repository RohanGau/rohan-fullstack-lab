import { create } from 'zustand';
import { IProfileDto } from '@fullstack-lab/types';

interface ProfileState {
  profile: IProfileDto[] | null;
  setProfile: (profile: IProfileDto[]) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
