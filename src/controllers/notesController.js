import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const { tag, search, page = 1, perPage = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);
    const skip = (pageNumber - 1) * perPageNumber;

    // Шукаємо тільки нотатки поточного користувача
    const notesQuery = Note.find().where('userId').equals(req.user._id);
    if (tag) notesQuery.where('tag').equals(tag);
    if (search) {
      notesQuery.or([{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }]);
    }
    const notes = await notesQuery.skip(skip).limit(perPageNumber);

    // Рахуємо кількість нотаток тільки поточного користувача
    const countQuery = Note.countDocuments().where('userId').equals(req.user._id);
    if (tag) countQuery.where('tag').equals(tag);
    if (search) {
      countQuery.or([{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }]);
    }
    const totalNotes = await countQuery;
    const totalPages = Math.ceil(totalNotes / perPageNumber);

    res.status(200).json({ page: pageNumber, perPage: perPageNumber, totalNotes, totalPages, notes });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, userId: req.user._id });
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const newNote = await Note.create({ ...req.body, userId: req.user._id });
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.noteId, userId: req.user._id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedNote) throw createHttpError(404, 'Note not found');
    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.noteId, userId: req.user._id });
    if (!deletedNote) throw createHttpError(404, 'Note not found');
    res.status(200).json(deletedNote);
  } catch (error) {
    next(error);
  }
};
