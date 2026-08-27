import { render, screen  } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('event handler gets correct values when submit is pressed', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} />)

  const title = screen.getByLabelText('title')
  const author = screen.getByLabelText('author')
  const url = screen.getByLabelText('url')
  const sendButton = screen.getByText('create')

  await user.type(title, 'My test blog')
  await user.type(author, 'Jack')
  await user.type(url, 'blogsfortesting.com')
  await user.click(sendButton)

  expect(createBlog.mock.calls[0][0])
    .toStrictEqual({ title: 'My test blog',
      author: 'Jack',
      url: 'blogsfortesting.com'
    })
})