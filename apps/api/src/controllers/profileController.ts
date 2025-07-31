import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Profile from '../models/Profile';
import logger from '../utils/logger';
import { profileSchema, profileUpdateSchema } from '../validation/profile';
import { CMS_ERROR_MESSAGES as ERROR_MESSAGES } from '../utils';
import { validateSchema } from '../validation';

export const validateProfileCreate = validateSchema(profileSchema);
export const validateProfileUpdate = validateSchema(profileUpdateSchema);

export const createProfile = async (req: Request, res: Response) => {
  try {
    const profile = new Profile(req.validatedBody);
    const saved = await profile.save();
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

export const getAllProfiles = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
    const range = req.query.range ? JSON.parse(req.query.range as string) : [0, 9];
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) : ['createdAt', 'DESC'];

    const skip = range[0];
    const limit = range[1] - range[0] + 1;
    const sortField = sort[0];
    const sortOrder = sort[1] === 'DESC' ? -1 : 1;
    const total = await Profile.countDocuments(filter);

    const profiles = await Profile.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    const transformed = profiles.map((profile) => {
      const profileObj = profile.toObject();
      profileObj.id = profileObj._id;
      delete profileObj._id;
      return profileObj;
    });

    res.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range');
    res.set('X-Total-Count', total.toString());
    res.set('Content-Range', `blogs ${skip}-${skip + profiles.length - 1}/${total}`);

    res.status(200).json(transformed);
  } catch (err: any) {
    logger.error({ err }, 'Fetching profiles failed');
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_FAILED });
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

    const updated = await Profile.findByIdAndUpdate(id, filteredBody, { new: true });

    if (!updated) {
      logger.warn({ id }, 'Profile not found');
      return res.status(404).json({ error: ERROR_MESSAGES.PROFILE_NOT_FOUND });
    }

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

    res.status(204).send();
  } catch (err: any) {
    logger.error({ err }, 'Failed to delete profile');
    res.status(500).json({ error: ERROR_MESSAGES.DELETE_FAILED });
  }
};

export const getProfileById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: ERROR_MESSAGES.INVALID_ID_FOND });
  }

  try {
    const found = await Profile.findById(id);
    if (!found) {
      return res.status(404).json({ error: ERROR_MESSAGES.PROFILE_NOT_FOUND });
    }

    const profileObj = found.toObject();
    profileObj.id = profileObj._id;
    delete profileObj._id;

    res.status(200).json(profileObj);
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch profile by id');
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_FAILED });
  }
};
