import { IProfileDto } from "@fullstack-lab/types";
export interface ProfileSectionProps {
  user: IProfileDto | null;
  loading: boolean;
  error: string | null;
}