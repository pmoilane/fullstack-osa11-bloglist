import { useState } from 'react'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [expanded, setExpanded] = useState(false)

  const hideWhenExpanded = { display: expanded ? 'none' : '' }
  const showWhenExpanded = { display: expanded ? '' : 'none' }

  const incrementLikes = () => {
    updateBlog({
      ...blog,
      likes: blog.likes + 1
    })
  }

  const blogStyle = {
    paddingTop: 5,
    paddingLeft: 5,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  return (
    <li>
      <div style={blogStyle}>
        <div style={hideWhenExpanded}>
          {blog.title} {blog.author}
          <button onClick={() => setExpanded(!expanded)}>view</button>
        </div>
        <div style={showWhenExpanded}>
          <div>
            {blog.title}
            <button onClick={() => setExpanded(!expanded)}>hide</button>
          </div>
          <div>{blog.author}</div>
          <div>{blog.url}</div>
          <div>likes {blog.likes}<button onClick={incrementLikes}>like</button><br /></div>
          <div>{blog.user.name}</div>
          <div>
            {blog.user.username === user.username &&
            (<button
              style={{ background: '#9932CC', borderRadius: 10 }}
              onClick={() => {
                if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
                  deleteBlog(blog.id)}}}>
              remove
            </button>
            )}
          </div>
        </div>
      </div>
    </li>
  )}

export default Blog