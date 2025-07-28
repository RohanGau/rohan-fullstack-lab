export interface IProfile {
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  title: string;
  yearsOfExperience: number;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}
