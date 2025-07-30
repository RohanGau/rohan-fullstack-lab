export interface Skill {
  name: string;
  rating: number; // out of 10
  yearsOfExperience: number;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  title: string;
  yearsOfExperience: number;
  skills: Skill[];
  githubUrl?: string;
  linkedinUrl?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}
