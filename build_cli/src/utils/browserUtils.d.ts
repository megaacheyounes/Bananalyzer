import { Page } from 'puppeteer';
declare const BrowserUtils: {
    getTextContent: (page: Page, selector: string) => Promise<string | undefined>;
    getHref: (page: Page, selector: string) => Promise<string | undefined>;
};
export default BrowserUtils;
