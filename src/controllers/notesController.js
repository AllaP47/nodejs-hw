import createHttpError from 'http-errors';
import { Note } from '../models/note.js';


export const getAllNotes = async (req, res, next) => {
  try {
    const { tag, search, page = 1, perPage = 10 } = req.query;
    
    // Перетворюємо параметри пагінації на числа
    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);

  
    const skip = (pageNumber - 1) * perPageNumber;

   
    const filter = {};

    if (tag) {
      filter.tag = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

   
    const totalNotes = await Note.countDocuments(filter);

    
    const notes = await Note.find(filter)
      .skip(skip)
      .limit(perPageNumber);

   
    const totalPages = Math.ceil(totalNotes / perPageNumber);

   
    res.status(200).json({
      page: pageNumber,
      perPage: perPageNumber,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};


export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    if (!note) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};


export const createNote = async (req, res, next) => {
  try {
    const newNote = await Note.create(req.body);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};


export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    
    const updatedNote = await Note.findByIdAndUpdate(noteId, req.body, {
      returnDocument: 'after', 
      runValidators: true,     
    });

    if (!updatedNote) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};


export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(deletedNote);
  } catch (error) {
    next(error);
  }
};
