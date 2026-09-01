import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: false, default: '', trim: true },
    tag: { type: String, required: false, default: 'Todo', trim: true, enum: TAGS },
    // Поле зв'язку з користувачем
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true, versionKey: false },
);

noteSchema.index({ tag: 1 });
noteSchema.index({ userId: 1 }); 

export const Note = model('Note', noteSchema);




