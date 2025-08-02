export interface Skills {
  name: string;
  rating: number;
  yearsOfExperience: number;
}

export interface ArchitectureArea {
  title: string;
  topics: string[];
}

export interface IProfileBase {
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
}

export interface IProfileDb extends IProfileBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfileDto extends IProfileBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
