const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'tester',
        password: 'salainen',
      },
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'tester', 'salainen')
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'tester', 'wrong')

      const notification = page.getByText('wrong username or password')
      await expect(notification).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })

    describe('When logged in', () => {
      beforeEach(async ({ page }) => {
        await loginWith(page, 'tester', 'salainen')
      })

      test('a new blog can be added', async ({ page }) => {
        await createBlog(page, {
          title: 'Test blog',
          author: 'Blog Author',
          url: 'testblog.com',
        })

        const notification = page.getByText(
          'Test blog by Blog Author was added!',
        )
        await expect(notification).toHaveCSS('color', 'rgb(0, 128, 0)')

        await expect(page.getByText('Test blog Blog Author')).toBeVisible()
      })

      describe('and a blog exists on the list', () => {
        beforeEach(async ({ page }) => {
          await createBlog(page, {
            title: 'Test blog',
            author: 'Blog Author',
            url: 'testblog.com',
          })
        })

        test('a blog can be liked', async ({ page }) => {
          await page.getByRole('button', { name: 'view' }).click()
          await expect(page.getByText('likes 0')).toBeVisible()
          await page.getByRole('button', { name: 'like' }).click()
          await expect(page.getByText('likes 1')).toBeVisible()
        })

        test('a blog can be deleted', async ({ page }) => {
          await expect(page.getByRole('listitem')).toHaveCount(1)
          await page.getByRole('button', { name: 'view' }).click()
          const removeButton = page.getByRole('button', { name: 'remove' })
          page.on('dialog', (dialog) => dialog.accept())
          await removeButton.click()
          await expect(page.getByRole('listitem')).toHaveCount(0)
          await expect(
            page.getByText('Removed Test blog by Blog Author'),
          ).toBeVisible()
        })

        test('only the correct user sees the remove button', async ({
          page,
          request,
        }) => {
          await request.post('/api/users', {
            data: {
              name: 'Test User2',
              username: 'tester2',
              password: 'salainen',
            },
          })
          await page.getByRole('button', { name: 'log out' }).click()
          await loginWith(page, 'tester2', 'salainen')
          await page.getByRole('button', { name: 'view' }).click()
          await expect(
            page.getByRole('button', { name: 'remove' }),
          ).toBeHidden()
        })
        describe('when multiple blogs exist', () => {
          beforeEach(async ({ page, request }) => {
            const user = await page.evaluate(() =>
              localStorage.getItem('loggedBlogappUser'),
            )
            const userObject = JSON.parse(user)
            await request.post('/api/blogs', {
              headers: {
                Authorization: `Bearer ${userObject.token}`,
              },
              data: {
                title: 'Test blog2',
                author: 'Blog Writer',
                url: 'blogsfortesting.com',
                likes: 10,
              },
            })
            await request.post('/api/blogs', {
              headers: {
                Authorization: `Bearer ${userObject.token}`,
              },
              data: {
                title: 'Test blog3',
                author: 'Blog Writer',
                url: 'blogsfortesting.com',
                likes: 1,
              },
            })
            await request.post('/api/blogs', {
              headers: {
                Authorization: `Bearer ${userObject.token}`,
              },
              data: {
                title: 'Test blog4',
                author: 'Blog Writer',
                url: 'blogsfortesting.com',
                likes: 5,
              },
            })
            page.reload()
            await page
              .getByRole('listitem')
              .filter({ hasText: 'Test blog2' })
              .waitFor()
          })
          test('blogs are sorted by the amount of likes', async ({ page }) => {
            let likesArray = []
            for (const row of await page.getByRole('listitem').all()) {
              const likeString = await row.getByText('likes').textContent()
              likesArray.push(Number(likeString.split(' ')[1].split('l')[0]))
            }
            const comparisonArray = likesArray.toSorted((a, b) => b - a)
            expect(likesArray).toEqual(comparisonArray)
          })
        })
      })
    })
  })
})
