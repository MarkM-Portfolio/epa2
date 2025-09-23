const mongoose = require('mongoose')
require('dotenv').config()

let DB_URI

if (process.env.DB_ENV === 'production') {
  DB_URI = process.env.DB_PROD
}

if (process.env.DB_ENV === 'development') {
  DB_URI = process.env.DB_DEV
}

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log(`\nDatabase is Connected.\n`)
  })
  .catch(err => console.log(err.message))
  