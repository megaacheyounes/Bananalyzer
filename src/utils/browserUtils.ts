import { Page } from 'puppeteer';

const BrowserUtils = {
  elementExist: async (page: Page, selector: string): Promise<boolean> => {
    const element = await page.$(selector);
    return !!element;
  },
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
  getSrc: async (page: Page, selector: string): Promise<string | undefined> => {
    const element = await page.$(selector);
    if (!element) return;
    const src = await page.evaluate((el) => el.src, element);
    return src;
  },
};

export default BrowserUtils;
