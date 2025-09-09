import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search = '' } = req.query;
  const skip = (page - 1) * perPage;

  // UPDATE: добавили в кверю поиск по id юзера
  const notesQuery = Note.find({ userId: req.user._id });

  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  if (search) {
    notesQuery.or([
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ]);
  }

  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);
  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

export const getNoteById = async (req, res, next) => {
  // UPDATE: изменили findById на findOne и добавили в поиск критерий по userId
  const note = await Note.findOne({
    _id: req.params.noteId,
    userId: req.user._id,
  });

  if (!note) {
    return next(createHttpError(404, 'Note not found'));
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  // UPDATE: Добавили userId
  const newNote = await Note.create({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json(newNote);
};

export const deleteNote = async (req, res, next) => {
  // UPDATE: Добавили проверку владельца через userId
  const note = await Note.findOneAndDelete({
    _id: req.params.noteId,
    userId: req.user._id,
  });

  if (!note) {
    return next(createHttpError(404, 'Note not found'));
  }

  res.status(200).send(note);
};

export const updateNote = async (req, res, next) => {
  // UPDATE: Добавили проверку владельца через userId
  const note = await Note.findOneAndUpdate(
    {
      _id: req.params.noteId,
      userId: req.user._id,
    },
    req.body,
    {
      new: true,
    },
  );

  if (!note) {
    return next(createHttpError(404, 'Note not found'));
  }

  res.status(200).json(note);
};
