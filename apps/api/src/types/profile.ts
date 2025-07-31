export interface Skills {
  name: string;
  rating: number;
  yearsOfExperience: number;
}

export interface ArchitectureArea {
  title: string;
  topics: string[];
}

export interface IProfile {
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  title: string;
  yearsOfExperience: number;
  skills: Skills[];
  githubUrl?: string;
  linkedinUrl?: string;
  location?: string;
  topSkills?: string[];
  allTechStack?: string[];
  architectureAreas?: ArchitectureArea[];
  philosophy?: string;
  impact?: string[];

  createdAt: Date;
  updatedAt: Date;
}
