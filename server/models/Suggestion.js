import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ['new', 'reviewed'],
    default: 'new',
    required: true,
  },
}, { timestamps: true });

suggestionSchema.index({ status: 1, createdAt: -1 });

export const Suggestion = mongoose.models.Suggestion
  || mongoose.model('Suggestion', suggestionSchema);
