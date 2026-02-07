import { Request, Response } from 'express';
import Contact from '../models/contact';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { validateSchema } from '../validation';
import { contactSchema } from '../validation/contact';
import { CONTACT_ERROR_MESSAGES } from '../utils/constant';
import { makeListHandler } from '../lib/controller';
import { cache } from '../lib/cache';

export const validateContactCreate = validateSchema(contactSchema);
const NS = 'contacts';

export const createContact = async (req: Request, res: Response) => {
  try {
    const contact = await Contact.create(req.validatedBody);
    await cache.bumpVersionNS(NS);
    const result = contact.toObject();
    result.id = result._id;
    delete result._id;

    res.status(201).json({ result });
  } catch (err) {
    logger.error('❌ Contact creation failed:', err);
    res.status(500).json({ error: CONTACT_ERROR_MESSAGES.CREATION_FAILED });
  }
};

export const getContacts = makeListHandler({
  ns: NS,
  model: Contact,
  buildQuery: (filter) => filter || {},
  allowedSort: ['createdAt', 'updatedAt', 'name', 'email'],
});

export const deleteContact = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Invalid ID' });
  }

  try {
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    await cache.bumpVersionNS(NS);
    res.status(204).send();
  } catch (err) {
    logger.error('❌ Delete failed:', err);
    res.status(500).json({ error: CONTACT_ERROR_MESSAGES.DELETE_FAILED });
  }
};
