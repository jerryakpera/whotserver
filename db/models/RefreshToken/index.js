const config = require("../../../config")
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')

const refreshTokenSchema = new mongoose.Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  token: {
    type: String,
    required: true,
    unique: true,
  }
}, {
  versionKey: false,
  timestamps: true
})

const refreshTokenExpiresAfter = config.jwtExpiryInSeconds + 60
refreshTokenSchema.index({"createdAt": 1}, {expiresAfterSeconds: refreshTokenExpiresAfter})

refreshTokenSchema.plugin(uniqueValidator)

module.exports = mongoose.model("RefreshToken", refreshTokenSchema)