import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  phone:     { type: String },

  address: {
    street:     { type: String },
    city:       { type: String },
    province:   { type: String },
    country:    { type: String },
    postalCode: { type: String },
  },

  emergencyContact: {
    name:     { type: String },
    relation: { type: String },
    phone:    { type: String },
  },

  profilePhoto:     { type: String },
  resume:           { type: String },
  workLocation:     { type: String },
  employmentStatus: {
    type: String,
    enum: ['active', 'on leave', 'terminated'],
    default: 'active',
  },

  occupation: { type: String, default: '' },

  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Employee'],
    default: 'Employee',
  },

  approved: {
    type: Boolean,
    default: false,
  },

  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpire: {
    type: Date,
    default: null,
  }

}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
