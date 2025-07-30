export interface Skills {
  name: string;
  rating: number;
  yearsOfExperience: number;
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
  createdAt: Date;
  updatedAt: Date;
}
