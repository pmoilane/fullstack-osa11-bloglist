import { render, screen  } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title and author, but not likes or url', async () => {
  const blog = {
    user: {
      id: '321321',
      username: 'tester',
      name: 'React Tester'
    },
    likes: 7,
    author: 'John S.',
    title: 'This is my blog',
    url: 'blogsfortesting.com'
  }
  const appUser = {
    id: '321321',
    username: 'tester',
    name: 'React Tester'
  }
  render(<Blog blog={blog} user={appUser}/>)

  const element = screen.getByText('This is my blog John S.')

  expect(element).toBeDefined()

  const element2 = screen.getByText('blogsfortesting.com')
  expect(element2).not.toBeVisible()
  const element3 = screen.getByText(`likes ${blog.likes}`)
  expect(element3).not.toBeVisible()
})

test('after pressing "view", also show likes and url', async () => {
  const blog = {
    user: {
      id: '321321',
      username: 'tester',
      name: 'React Tester'
    },
    likes: 7,
    author: 'John S.',
    title: 'This is my blog',
    url: 'blogsfortesting.com'
  }
  const appUser = {
    id: '321321',
    username: 'tester',
    name: 'React Tester'
  }
  const user = userEvent.setup()

  render(<Blog blog={blog} user={appUser}/>)

  const viewButton = screen.getByText('view')

  await user.click(viewButton)

  const element = screen.getByText('blogsfortesting.com')
  expect(element).toBeVisible()
  const element2 = screen.getByText(`likes ${blog.likes}`)
  expect(element2).toBeVisible()
})

test('clicking like button twice, calls event handler twice', async () => {
  const blog = {
    user: {
      id: '321321',
      username: 'tester',
      name: 'React Tester'
    },
    likes: 7,
    author: 'John S.',
    title: 'This is my blog',
    url: 'blogsfortesting.com'
  }
  const appUser = {
    id: '321321',
    username: 'tester',
    name: 'React Tester'
  }
  const user = userEvent.setup()
  const mockHandler = vi.fn()

  render(<Blog blog={blog} user={appUser} updateBlog={mockHandler}/>)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})

