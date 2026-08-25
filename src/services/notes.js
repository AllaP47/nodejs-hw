import { NotesCollection } from '../models/note.js';

export const getAllNotesFromDB = async () => {
  return await NotesCollection.find();
};

export const getNoteByIdFromDB = async (noteId) => {
  return await NotesCollection.findById(noteId);
};

export const createNoteInDB = async (payload) => {
  return await NotesCollection.create(payload);
};

export const updateNoteInDB = async (noteId, payload) => {
  return await NotesCollection.findByIdAndUpdate(noteId, payload, {
    new: true,
    runValidators: true,
  });
};

export const deleteNoteFromDB = async (noteId) => {
  return await NotesCollection.findByIdAndDelete(noteId);
};
