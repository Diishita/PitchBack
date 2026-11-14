import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true,
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true,
  },
  playerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 25,
  },
  dob: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  },
  emergencyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  emergencyAge: {
    type: Number,
    required: true,
    min: 0,
    max: 120,
  },
  emergencyRelation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60,
  },
  emergencyContact: {
    type: String,
    required: true,
    trim: true,
    maxlength: 25,
  },
  medicalInfo: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: '',
  },
  requirements: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: '',
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
}, { timestamps: true });

export const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
