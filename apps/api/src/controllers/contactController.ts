import { Request, Response } from 'express';
import Contact from '../models/contact';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { validateSchema } from '../validation';
import { contactSchema } from '../validation/contact';
import { CONTACT_ERROR_MESSAGES } from '../utils';

export const validateContactCreate = validateSchema(contactSchema);

export const createContact = async (req: Request, res: Response) => {
  try {
    const contact = await Contact.create(req.body);
    const result = contact.toObject();
    result.id = result._id;
    delete result._id;

    res.status(201).json({ result });
  } catch (err) {
    logger.error('❌ Contact creation failed:', err);
    res.status(500).json({ error: CONTACT_ERROR_MESSAGES.CREATION_FAILED });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const { _start = 0, _end = 10, _sort = 'createdAt', _order = 'DESC' } = req.query;

    const skip = Number(_start);
    const limit = Number(_end) - skip;

    const sort: any = { [_sort as string]: _order === 'DESC' ? -1 : 1 };

    const total = await Contact.countDocuments();
    const contacts = await Contact.find().sort(sort).skip(skip).limit(limit);

    const data = contacts.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    res.set('X-Total-Count', total.toString());
    res.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range');
    res.set('Content-Range', `blogs ${skip}-${skip + contacts.length - 1}/${total}`);

    res.status(200).json(data);
  } catch (err) {
    logger.error('❌ Failed to fetch contacts:', err);
    res.status(500).json({ error: CONTACT_ERROR_MESSAGES.FETCH_FAILED });
  }
};

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
    res.status(204).send();
  } catch (err) {
    logger.error('❌ Delete failed:', err);
    res.status(500).json({ error: CONTACT_ERROR_MESSAGES.DELETE_FAILED });
  }
};
