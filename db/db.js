const config = require("../config")
// Mongoose module
const mongoose = require('mongoose')

// Connect to DB with user and authentication
mongoose.connect("mongodb+srv://main_user:18QWNQisA7A6UY6z@cluster0.sut5e.mongodb.net/whotgame?retryWrites=true&w=majority", {
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