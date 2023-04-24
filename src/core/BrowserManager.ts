import debugModule from 'debug';
import { Browser, Page } from 'puppeteer';
import { CHROMIUM_EXEC_PATH, CHROMIUM_INSTALL_PATH, CHROMIUM_REVISION } from '../consts';
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
import puppeteer from 'puppeteer-extra';

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

//@ts-ignore
import PCR from 'puppeteer-chromium-resolver';
const options = {};

const debug = debugModule('bananalyzer:browserManager');

// use one browser instance
let browser: undefined | Browser;

/**
 * this function will try to find and lunch chrome, if that fails it will try to download it and open it again
 * if chrome keeps failing to lunch, this function will give up after 3 attempts, and probably move to another place where it will start a new life as a vegan transgender
 */
// export const downoadChromiumIfMissing = async () => {
//   var chromLaunched = false;

//   for (let i = 0; i < 3 && !chromLaunched; i++) {
//     chromLaunched = await attemptToOpenOrDownloadChrome();
//     debug('chrom launched' + chromLaunched);
//     return true;
//   }

//   console.log('3 attemps at downloading Chormium have all failed!');
//   throw Error('3 attemps at downloading Chormium have all failed!');
// };

const elementExist = async (page: Page, selector: string): Promise<boolean> => {
  const element = await page.$(selector);
  return !!element;
};
const getTextContent = async (page: Page, selector: string): Promise<string> => {
  const element = await page.$(selector);
  if (!element) return '';
  const textContent = await page.evaluate((el) => el.textContent, element);
  await element.dispose();
  return textContent || '';
};
const getHref = async (page: Page, selector: string): Promise<string> => {
  const element = await page.$(selector);
  if (!element) return '';
  const href = await page.evaluate((el) => el.getAttribute('href'), element);
  await element.dispose();
  return href || '';
};
const getSrc = async (page: Page, selector: string): Promise<string> => {
  const element = await page.$(selector);
  if (!element) return '';
  const src = await page.evaluate((el) => el.getAttribute('src'), element);
  await element.dispose();
  return src || '';
};

const getBrowser = async (): Promise<Browser> => {
  const stats = await PCR(options);
  browser = await stats.puppeteer
    .launch({
      headless: true,
      executablePath: stats.executablePath,
    })
    .catch((err: any) => debug('initBrowser failed', err));

  return browser!;
  // return await puppeteer.launch({
  //   executablePath: CHROMIUM_EXEC_PATH,
  // });
};

/**
 * return chromium tab object (page)
 * @param {boolean} openBrowser if true, it will force create new instance of browser
 */
const getChromiumPage = async (openBrowser: boolean = false): Promise<Page> => {
  // try {
  //   await downoadChromiumIfMissing();
  // } catch (e) {
  //   debug(e);
  // }
  if (!browser || openBrowser) {
    browser = await getBrowser();
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

/**
 * as the name suggestes, this function simply try to get a browser instance
 * when chromium is missing, partially downloaded or corrupted, `puppetter.launch` will throw an exception, and that when the function downloads chromium browser
 *
 * @return {Promise} true if chrom is installed and can be launched, false otherwise
 */
// const attemptToOpenOrDownloadChrome = () =>
//   new Promise<boolean>(async (resolve, reject) => {
//     try {
//       const browser = await getBrowser();
//       await browser.close();
//       debug('downoadChromiumIfMissing: browser launched fine ( will not download )');
//       resolve(true);
//     } catch (e) {
//       debug('failed to launch browser, chormium might be missing');
//       // download choromium

//       console.log('downloading chromium, please wait...');

//       const execPath = await downloadChromium({
//         revision: CHROMIUM_REVISION, // chrom version that works for this pupputeer version, you may change this if you upgrade/downgrade puppetter
//         installPath: CHROMIUM_INSTALL_PATH,
//       }).catch((err: Error) => {
//         debug('download-chromium failed');
//         reject(err);
//       });
//       debug('download-chromium succeed : ' + CHROMIUM_EXEC_PATH);
//       debug('path = ' + execPath);
//       resolve(false);
//     }
//   });
