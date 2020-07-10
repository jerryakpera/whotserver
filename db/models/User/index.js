const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  role: {
    type: Number,
    default: 2,
    required: true
  },
  played: {
    type: Number,
    default: 0,
  },
  won: {
    type: Number,
    default: 0,
  },
  lost: {
    type: Number,
    default: 0,
  },
  flag: {
    type: Number,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    required: true
  },
  hash: {
    type: String,
    required: true
  }

}, {
  versionKey: false,
  timestamps: true
})


userSchema.plugin(uniqueValidator)
module.exports = mongoose.model("User", userSchema)