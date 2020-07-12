const config = require("../config")
// Mongoose module
const mongoose = require('mongoose')
const ENV = require("../config/env")
const dbURL = ENV === "dev" ? config.dbURL : process.env.DBURL

// Connect to DB with user and authentication
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
const db = mongoose.connection
// check for database errors
db.on('error', (err) => {
  console.log(err)
})
// If connected log connected to mongodb
db.once('open', () => {
  console.log('Connected to MongoDB')
})

module.exports = db