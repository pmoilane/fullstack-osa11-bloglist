const supertest = require('supertest')
const mongoose = require('mongoose')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.blogs)
})

describe('tests for GET "/api/blogs"', () => {
  test('correct number of JSON blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(response.body.length, helper.blogs.length)
  })
  test('indentifier key for blogs is called id', async () => {
    const response = await api
      .get('/api/blogs')
    const checkResults = response.body.map((blog) => blog.id ? true : false)
    assert.strictEqual(checkResults.every(check => check === true), true)
  })
})

describe('tests for POST "/api/blogs"', async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('salas_na', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
  const loginresponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'salas_na' })

  test('blogs can be added', async () => {
    const blogsBeforePOST = await api.get('/api/blogs')
    const newBlog = {
      "title": "My Blog",
      "author": "John",
      "url": "http://blogman.com",
      "likes": 2
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginresponse.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsAfterPOST = await api.get('/api/blogs')
    assert.strictEqual(blogsBeforePOST.body.length + 1, blogsAfterPOST.body.length)
    const checkBlogs = blogsAfterPOST.body.some(blog => 
      blog.title === newBlog.title &&
      blog.author === newBlog.author &&
      blog.url === newBlog.url &&
      blog.likes === newBlog.likes
    )
    assert.strictEqual(checkBlogs, true)
  })
  test('if blog does not have likes field, it gets value 0', async () => {
    const newBlog = {
      "title": "My Blog",
      "author": "John",
      "url": "http://blogman.com"
    }
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginresponse.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(response.body.likes, 0)
  })
  test('if blog does not have a title or author, return status 400 Bad Request', async () => {
    const newBlog = {
      "author": "John",
      "url": "http://blogman.com"
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginresponse.body.token}`)
      .send(newBlog)
      .expect(400)
    const newBlog2 = {
      "title": "My Blog",
      "url": "http://blogman.com"
    }
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginresponse.body.token}`)
      .send(newBlog2)
      .expect(400)
  })
  test('if request does not have token, return status 401 Unauthorized', async () => {
    const newBlog = {
      "title": "My Blog",
      "author": "John",
      "url": "http://blogman.com"
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})
describe('tests for DELETE "/api/blogs"', () => {
  test('delete blog by id', async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('salas_na', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()

    const loginresponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'salas_na' })

    const newBlog = {
        "title": "My Blog",
        "author": "John",
        "url": "http://blogman.com"
      }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginresponse.body.token}`)
      .send(newBlog)

    const blogsBeforeDELETE = await api.get('/api/blogs')

    await api
      .delete(`/api/blogs/${response.body.id}`)
      .set('Authorization', `Bearer ${loginresponse.body.token}`)
      .expect(204)

    const blogsAfterDELETE = await api.get('/api/blogs')
    assert.strictEqual(blogsBeforeDELETE.body.length - 1, blogsAfterDELETE.body.length)
  })
})
describe('tests for PUT "/api/blogs"', () => {
  test('update blog by id', async () => {
    const blogs = await api.get('/api/blogs')
    const updatedBlog = { ...blogs.body[0], likes: 28 }
    const returnedBlog = await api
      .put(`/api/blogs/${updatedBlog.id}`)
      .send(updatedBlog)
      .expect(200)
    assert.deepStrictEqual(updatedBlog, returnedBlog.body)
  })
})

describe('tests for POST /api/users', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('salas_na', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('creation of user with too short of a username fails with proper statuscode', async () => {
    const usersBeforePOST = await helper.usersInDb()
    const newUser = {
      username: 'Te',
      name: "Testi",
      password: 's_lasana'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfterPOST = await helper.usersInDb()

    assert(result.body.error.includes('username and password must be at least 3 characters long'))
    assert.strictEqual(usersBeforePOST.length, usersAfterPOST.length)
  })

  test('creation of user with too short of a password fails with proper statuscode', async () => {
    const usersBeforePOST = await helper.usersInDb()
    const newUser = {
      username: 'Test',
      name: "Testi",
      password: 's_'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfterPOST = await helper.usersInDb()

    assert(result.body.error.includes('username and password must be at least 3 characters long'))
    assert.strictEqual(usersBeforePOST.length, usersAfterPOST.length)
  })

  test('creation of user fails if username already taken with proper statuscode', async () => {
    const usersBeforePOST = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: "Testi",
      password: 'salasan_'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfterPOST = await helper.usersInDb()

    assert(result.body.error.includes('username is already taken'))
    assert.strictEqual(usersBeforePOST.length, usersAfterPOST.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})