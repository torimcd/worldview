// @ts-check
const { test, expect } = require('playwright-test-coverage')
const createSelectors = require('../../test-utils/global-variables/selectors')
const { skipTour } = require('../../test-utils/global-variables/querystrings')

let page
let selectors

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  })
  page = await context.newPage()
  selectors = createSelectors(page)
})

test.afterAll(async () => {
  await page.close()
})

test('Location Search component is visible by default', async () => {
  const { locationSearchMobileDialog, modalCloseButton } = selectors
  await page.goto(skipTour)
  await modalCloseButton.click()
  await expect(locationSearchMobileDialog).not.toBeVisible()
})

test('Clicking Location Search toolbar button opens the Location Search mobile dialog', async () => {
  const { locationSearchMobileDialog, locationSearchToolbarButton } = selectors
  await locationSearchToolbarButton.click()
  await expect(locationSearchMobileDialog).toBeVisible()
})
