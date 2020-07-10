const config = require("../config")
// Mongoose module
const mongoose = require('mongoose')

// Connect to DB with user and authentication
mongoose.connect("mongodb://heroku_jck3tnkm:6hhrrbjgf1tvsec934ldjs107g@ds245615.mlab.com:45615/heroku_jck3tnkm", {
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