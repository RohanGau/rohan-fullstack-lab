import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Profile from '../models/Profile';
import logger from '../utils/logger';
import { profileSchema, profileUpdateSchema } from '../validation/profile';
import { CMS_ERROR_MESSAGES as ERROR_MESSAGES } from '../utils/constant';
import { validateSchema } from '../validation';
import { cache } from '../lib/cache';
import { makeGetByIdHandler, makeListHandler } from '../lib/controller';

export const validateProfileCreate = validateSchema(profileSchema);
export const validateProfileUpdate = validateSchema(profileUpdateSchema);
const NS = 'profiles';

export const getAllProfiles = makeListHandler({
  ns: NS,
  model: Profile,
  buildQuery: (filter) => filter || {},
  allowedSort: ['createdAt', 'updatedAt', 'name', 'email', 'yearsOfExperience'],
  // SECURITY: Explicit allowlist for filterable fields to prevent NoSQL injection
  allowedFilterFields: ['name', 'email', 'title', 'location', 'yearsOfExperience'],
});

export const getProfileById = makeGetByIdHandler({
  ns: NS,
  model: Profile,
});

export const createProfile = async (req: Request, res: Response) => {
  try {
    const profile = new Profile(req.validatedBody);
    const saved = await profile.save();
    await cache.bumpVersionNS(NS);
    const savedObj = saved.toObject();
    const result = {
      id: savedObj._id?.toString(),
      ...savedObj,
    };
    delete result._id;
    res.status(201).json({ data: result });
  } catch (err: any) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({
        msg: 'Duplicate email',
        error: [
          {
            field: 'email',
            message: `Email "${err.keyValue.email}" is already in use`,
          },
        ],
      });
    }
    logger.error({ err }, 'Profile creation failed');
    res.status(500).json({ error: ERROR_MESSAGES.CREATE_FAILED });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    const allowedFields = [
      'name',
      'email',
      'title',
      'bio',
      'avatarUrl',
      'yearsOfExperience',
      'skills',
      'githubUrl',
      'linkedinUrl',
      'location',
      'topSkills',
      'allTechStack',
      'architectureAreas',
      'philosophy',
      'impact',
    ];

    const filteredBody: Record<string, any> = {};

    for (const key of allowedFields) {
      if (req.validatedBody[key] !== undefined) {
        filteredBody[key] = req.validatedBody[key];
      }
    }

    if (filteredBody.architectureAreas && Array.isArray(filteredBody.architectureAreas)) {
      filteredBody.architectureAreas = filteredBody.architectureAreas.map((area) => {
        if (area._id === null || area._id === undefined) {
          const { _id, ...rest } = area;
          return rest;
        }
        return area;
      });
    }

    const updated = await Profile.findByIdAndUpdate(id, filteredBody, { new: true });

    if (!updated) {
      logger.warn({ id }, 'Profile not found');
      return res.status(404).json({ error: ERROR_MESSAGES.PROFILE_NOT_FOUND });
    }

    await cache.bumpVersionNS(NS);

    const updatedObj = updated.toObject();
    updatedObj.id = updatedObj._id;
    delete updatedObj._id;

    res.status(200).json(updatedObj);
  } catch (err: any) {
    logger.error({ err }, 'Update profile failed');
    res.status(500).json({ error: ERROR_MESSAGES.UPDATE_FAILED });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    const deleted = await Profile.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: ERROR_MESSAGES.PROFILE_NOT_FOUND });
    }

    await cache.bumpVersionNS(NS);

    res.status(204).send();
  } catch (err: any) {
    logger.error({ err }, 'Failed to delete profile');
    res.status(500).json({ error: ERROR_MESSAGES.DELETE_FAILED });
  }
};
