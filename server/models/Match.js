import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  },
  time: {
    type: String,
    required: true,
    match: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  },
  place: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
}, { timestamps: true });

matchSchema.index({ date: 1, time: 1 });

export const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
