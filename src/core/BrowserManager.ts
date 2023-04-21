const downloadChromium = require('download-chromium');
import debugModule from 'debug';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import { CHROMIUM_EXEC_PATH, CHROMIUM_INSTALL_PATH, CHROMIUM_REVISION } from '../consts';

const debug = debugModule('bananalyzer:browserManager');

// use one browser instance
let browser: undefined | Browser;

/**
 * this function will try to find and lunch chrome, if that fails it will try to download it and open it again
 * if chrome keeps failing to lunch, this function will give up after 3 attempts, and probably move to another place where it will start a new life as a vegan transgender
 */
export const downoadChromiumIfMissing = async () => {
  var chromLaunched = false;

  for (let i = 0; i < 3 && !chromLaunched; i++) {
    chromLaunched = await attemptToOpenOrDownloadChrome();
    debug('chrom launched' + chromLaunched);
    return true;
  }

  console.log('3 attemps at downloading Chormium have all failed!');
  throw Error('3 attemps at downloading Chormium have all failed!');
};

const elementExist = async (page: Page, selector: string): Promise<boolean> => {
  const element = await page.$(selector);
  return !!element;
};
const getTextContent = async (page: Page, selector: string): Promise<string | undefined> => {
  const element = await page.$(selector);
  if (!element) return;
  const textContent = await page.evaluate((el) => el.textContent, element);
  return textContent;
};
const getHref = async (page: Page, selector: string): Promise<string | undefined> => {
  const element = await page.$(selector);
  if (!element) return;
  const href = await page.evaluate((el) => el.href, element);
  return href;
};
const getSrc = async (page: Page, selector: string): Promise<string | undefined> => {
  const element = await page.$(selector);
  if (!element) return;
  const src = await page.evaluate((el) => el.src, element);
  return src;
};
/**
 * return chromium tab object (page)
 * @param {boolean} openBrowser if true, it will force create new instance of browser
 */
const getChromiumPage = async (openBrowser: boolean = false): Promise<Page> => {
  try {
    await downoadChromiumIfMissing();
  } catch (e) {
    debug(e);
  }
  if (!browser || openBrowser) {
    browser = await puppeteer.launch({
      executablePath: CHROMIUM_EXEC_PATH, // comment when debugging, to use chromium thats included with pupputeer
    });
  }
  const page = await browser.newPage();
  // set viewport to a random mobile screen resolution
  await page.setViewport({
    width: 1280 + Math.floor(Math.random() * 100),
    height: 720 + Math.floor(Math.random() * 100),
  });

  // skip loading images and visual resources to reduce loding time
  await page.setRequestInterception(true);
  page.on('request', (request: any) => {
    if (request.isInterceptResolutionHandled()) {
      return;
    }
    const REQUESTS_TO_IGNORE = ['font', 'image', 'stylesheet', 'media', 'imageset'];
    if (REQUESTS_TO_IGNORE.indexOf(request.resourceType()) !== -1) {
      return request.abort();
    }
    request.continue();
  });
  return page;
};
/**
 * as the name suggestes, this function simply try to get a browser instance
 * when chromium is missing, partially downloaded or corrupted, `puppetter.launch` will throw an exception, and that when the function downloads chromium browser
 *
 * @return {Promise} true if chrom is installed and can be launched, false otherwise
 */
const attemptToOpenOrDownloadChrome = () =>
  new Promise<boolean>(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        executablePath: CHROMIUM_EXEC_PATH, // comment when debugging, to use chromium thats included with pupputeer
      });
      await browser.close();
      debug('downoadChromiumIfMissing: browser launched fine ( will not download )');
      resolve(true);
    } catch (e) {
      debug('failed to launch browser, chormium might be missing');
      // download choromium

      console.log('downloading chromium, please wait...');

      const execPath = await downloadChromium({
        revision: CHROMIUM_REVISION, // chrom version that works for this pupputeer version, you may change this if you upgrade/downgrade puppetter
        installPath: CHROMIUM_INSTALL_PATH,
      }).catch((err: Error) => {
        debug('download-chromium failed');
        reject(err);
      });
      debug('download-chromium succeed : ' + CHROMIUM_EXEC_PATH);
      debug('path = ' + execPath);
      resolve(false);
    }
  });
/**
 * close puppeteer browser and release resources
 */
export const closeBrowser = async () => {
  if (!!browser) {
    await browser.close();
    browser = undefined;
  } else {
    debug('failed to close browser');
  }
};
const BrowserManager = {
  elementExist,
  getHref,
  getTextContent,
  getSrc,
  getChromiumPage,
  closeBrowser,
};
export default BrowserManager;
