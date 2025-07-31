import { Schema, model, Document } from 'mongoose';
import { IProfile } from '../types/profile.js';

export interface ProfileDocument extends IProfile, Document {}

const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    yearsOfExperience: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ProfileSchema = new Schema<ProfileDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bio: { type: String },
    avatarUrl: { type: String },
    title: { type: String, required: true, trim: true },
    yearsOfExperience: { type: Number, required: true, min: 5 },
    skills: {
      type: [SkillSchema],
      required: true,
    },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    location: { type: String },
    topSkills: [String],
    allTechStack: [String],
    architectureAreas: [
      {
        title: String,
        topics: [String],
      },
    ],
    philosophy: { type: String },
    impact: [String],
  },
  {
    timestamps: true,
  }
);

export default model<ProfileDocument>('Profile', ProfileSchema);
