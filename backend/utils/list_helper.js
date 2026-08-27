const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((currentFav, blog) => (currentFav && currentFav.likes > blog.likes) ? currentFav : blog, null)
}

const mostBlogs = (blogs) => {
  if (blogs.length > 0) {
    return _(blogs)
          .countBy('author')
          .map((blogs, author) => ({
            'author': author,
            'blogs': blogs}))
          .maxBy('blogs')
  } else {
    return null
  }
}

const mostLikes = (blogs) => {
  if (blogs.length > 0) {
    return _(blogs)
          .groupBy('author')
          .map((blogs, author) => ({
            'author': author,
            'likes': _.sumBy(blogs, 'likes')}))
          .maxBy('likes')
  } else {
    return null
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}