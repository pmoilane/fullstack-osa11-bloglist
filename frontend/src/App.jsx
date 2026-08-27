import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: null })
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      blogService.setToken(user.token)
      setUser(user)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (error) {
      console.log(error.response.data)
      sendNotification({ message: 'wrong username or password', isError: true })
    }
  }

  const addBlog = async (blogObject) => {
    try {
      const addedBlog = await blogService.create(blogObject)
      blogFormRef.current.toggleVisibility()
      sendNotification({ message: `${addedBlog.title} by ${addedBlog.author} was added!`, isError: false })
      setBlogs(blogs.concat({ ...addedBlog, user: { id: addedBlog.user, name: user.name, username: user.username } }))
      return true
    } catch (error) {
      console.log(error)
      sendNotification({ message: error.response.data.error, isError: true })
      return false
    }
  }

  const updateBlog = async (blogObject) => {
    try {
      const updatedBlog = await blogService
        .update({
          user: blogObject.user.id,
          likes: blogObject.likes,
          author: blogObject.author,
          title: blogObject.title,
          url: blogObject.url
        }, blogObject.id)
      setBlogs(blogs.map(blog => (blog.id !== blogObject.id ? blog : { ...updatedBlog, user: blogObject.user })))
      return true
    } catch (error) {
      sendNotification({ message: error.response.data.error, isError: true })
      return false
    }
  }

  const deleteBlog = async (id) => {
    try {
      await blogService.remove(id)
      const removedBlog = blogs.find(blog => blog.id === id)
      setBlogs(blogs.filter(blog => blog.id !== id))
      sendNotification({ message: `Removed ${removedBlog.title} by ${removedBlog.author}`, isError: false })
    } catch (error) {
      console.log(error)
      sendNotification({ message: error.response.data.error, isError: true })
    }
  }

  const sendNotification = ({ message, isError }) => {
    console.log('sending notification')
    setNotification({ message, isError })
    setTimeout(() => {
      setNotification({ message: null })
    }, 5000)
  }

  if (user === null) {
    return (
      <div>
        <h2>login to application</h2>
        <Notification
          message={notification.message}
          isError={notification.isError}
        />
        <form onSubmit={handleLogin}>
          <div>
            <label>
              username
              <input
                type="text"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              password
              <input
                type="password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </label>
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification
        message={notification.message}
        isError={notification.isError}
      />
      <p>{user.name} logged in
        <button
          onClick={() => {window.localStorage.removeItem('loggedBlogappUser')
            setUser(null)
          }}>
          log out
        </button>
      </p>
      <Togglable buttonlabel="create new blog" ref={blogFormRef}>
        <BlogForm
          createBlog={addBlog}
        />
      </Togglable>
      <ul style={{ listStyleType: 'none', paddingInlineStart: '0px' }}>
        {blogs.sort((a, b) => b.likes - a.likes).map(blog =>
          <Blog key={blog.id}
            blog={blog}
            updateBlog={updateBlog}
            deleteBlog={deleteBlog}
            user={user}
          />
        )}
      </ul>
    </div>
  )
}

export default App