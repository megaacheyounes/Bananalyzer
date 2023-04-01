import { Page } from 'puppeteer';

const BrowserUtils = {
  getTextContent: async (page: Page, selector: string): Promise<string | undefined> => {
    const element = await page.$(selector);
    if (!element) return;
    const textContent = await page.evaluate((el) => el.textContent, element);
    return textContent;
  },
  getHref: async (page: Page, selector: string): Promise<string | undefined> => {
    const element = await page.$(selector);
    if (!element) return;
    const href = await page.evaluate((el) => el.href, element);
    return href;
  },
};

export default BrowserUtils;
