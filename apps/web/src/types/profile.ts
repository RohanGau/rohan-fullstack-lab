import { IProfileDto } from "@fullstack-lab/types";
export interface ProfileSectionProps {
  user: IProfileDto | null;
  loading: boolean;
  error: string | null;
}
export interface Skill  {
  name: string;
  rating: number;
  yearsOfExperience: number;
};

export interface SkillsProps {
  skills: Skill[] | undefined;
  fullStack?: string[];
  gridCols?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}