import { Router } from 'express';
import { celebrate } from 'celebrate';
import * as notesController from '../controllers/notesController.js';
import * as schemas from '../validations/notesValidation.js';

import { authenticate } from '../middleware/authenticate.js';

const router = Router();


router.get(
  '/notes',
  authenticate,
  celebrate(schemas.getAllNotesSchema),
  notesController.getAllNotes,
);

router.get(
  '/notes/:noteId',
  authenticate,
  celebrate(schemas.noteIdSchema),
  notesController.getNoteById,
);

router.post(
  '/notes',
  authenticate,
  celebrate(schemas.createNoteSchema),
  notesController.createNote,
);

router.patch(
  '/notes/:noteId',
  authenticate,
  celebrate(schemas.updateNoteSchema),
  notesController.updateNote,
);

router.delete(
  '/notes/:noteId',
  authenticate,
  celebrate(schemas.noteIdSchema),
  notesController.deleteNote,
);

export default router;

