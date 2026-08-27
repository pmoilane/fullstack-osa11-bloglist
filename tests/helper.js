const loginWith = async (page, username, password) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, content) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByLabel('title').fill(content.title)
  await page.getByLabel('author').fill(content.author)
  await page.getByLabel('url').fill(content.url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByRole('button', { name: 'create new blog' }).waitFor()
}

export { loginWith, createBlog }