const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')
const loginRouter = require('./controllers/login')
const path = require('path')

const app = express()

mongoose.connect(config.MONGODB_URI, { family: 4 })

app.use(express.json())
app.use(middleware.tokenExtractor)
app.use(express.static(path.join(__dirname, '../frontend/dist')))

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.errorHandler)

module.exports = app
