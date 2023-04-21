/**
 * get app details from google play using puppeteer
 */
import debugModule from 'debug';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';

import { CHROMIUM_EXEC_PATH } from '../consts';
import BrowserUtils from '../utils/browserUtils';
import { isValidDate } from '../utils/dateTimeUtils';
import { downoadChromiumIfMissing } from './downloader';

const debug = debugModule('bananalyzer:appDetailsScrapper');

// use one browser
let browser: undefined | Browser;

// block ads and tracker to speed page loading
// puppeteer.use(adblockerPlugin({ blockTrackers: true }));

enum DataToScrapeType {
  HREF,
  SRC,
  TEXT_CONTENT,
}

const APP_DETAILS_KEYS = [
  'packageName',
  'appName',
  'versionName',
  'description',
  'updatedOn',
  'releasedOn',
  'requiresAndroid',
  'rating',
  'downloads',
  'downloadsDetails',
  'developer',
  'reviewsNumber',
  'icon',
  'screenshots',
] as const;

enum Format {
  DATE,
  NOT_DATE,
}

type AppDetailsSelector = {
  selector: string | string[];
  type: DataToScrapeType;
  getFromAppDetailsDialog?: boolean;
  manyValues?: boolean;
  startingIndex?: number;
  multipleMaxCount?: number;
  format?: Format;
  transform?: { [key: string]: string };
};

type SelectorsType = {
  [key in typeof APP_DETAILS_KEYS[number]]: AppDetailsSelector;
};
type SelectorResultType = string | undefined | string[];
type AppDetails = {
  [key in typeof APP_DETAILS_KEYS[number]]: SelectorResultType;
};

const SELECTOR_MULTIPLE_INDEX = '__INDEX__';

const APP_DETAILS_SELECTORS: SelectorsType = {
  packageName: { selector: '.ignore' + new Date().getTime(), type: DataToScrapeType.TEXT_CONTENT },
  appName: { selector: '.Fd93Bb > span:nth-child(1)', type: DataToScrapeType.TEXT_CONTENT },
  versionName: {
    selector: 'div.sMUprd:nth-child(1) > div:nth-child(2)',
    type: DataToScrapeType.TEXT_CONTENT,
    getFromAppDetailsDialog: true,
  },
  description: {
    selector: '.fysCi > div:nth-child(1)',
    type: DataToScrapeType.TEXT_CONTENT,
    getFromAppDetailsDialog: true,
  },
  updatedOn: {
    //*[@id="yDmH0d"]/div[6]/div[2]/div/div/div/div/div[2]/div[3]/div[9]/div[2]

    selector: 'div.sMUprd:nth-child(2) > div:nth-child(2)',
    // selector: 'div.sMUprd:nth-child(2) > div:nth-child(2)',
    type: DataToScrapeType.TEXT_CONTENT,
    getFromAppDetailsDialog: true,
    format: Format.DATE,
  },
  releasedOn: {
    selector: ['div.sMUprd:nth-child(8) > div:nth-child(2)', 'div.sMUprd:nth-child(9) > div:nth-child(2)'],
    type: DataToScrapeType.TEXT_CONTENT,
    getFromAppDetailsDialog: true,
    format: Format.DATE,
  },
  requiresAndroid: {
    selector: 'div.sMUprd:nth-child(3) > div:nth-child(2)',
    type: DataToScrapeType.TEXT_CONTENT,
    getFromAppDetailsDialog: true,
    transform: {
      'Varies with device': 'VARY',
    },
  },
  rating: { selector: '.TT9eCd', type: DataToScrapeType.TEXT_CONTENT },
  downloads: { selector: 'div.wVqUob:nth-child(2) > div:nth-child(1)', type: DataToScrapeType.TEXT_CONTENT },
  downloadsDetails: {
    selector: 'div.sMUprd:nth-child(4) > div:nth-child(2)',
    type: DataToScrapeType.TEXT_CONTENT,
    getFromAppDetailsDialog: true,
  },
  developer: { selector: '.Vbfug > a:nth-child(1) > span:nth-child(1)', type: DataToScrapeType.TEXT_CONTENT },

  reviewsNumber: { selector: 'div.wVqUob:nth-child(1) > div:nth-child(2)', type: DataToScrapeType.TEXT_CONTENT },
  icon: {
    selector: '.cN0oRe',
    type: DataToScrapeType.SRC,
  },
  screenshots: {
    selector: `div.ULeU3b:nth-child(${SELECTOR_MULTIPLE_INDEX}) > div:nth-child(1) > img:nth-child(1)`,
    type: DataToScrapeType.SRC,
    manyValues: true,
    startingIndex: 1,
    multipleMaxCount: 8,
  },
};
// trying to hide that we are using a headless browser
//fixme: causes errors when building .exe
// puppeteer.use(stealthPlugin());
// download from https://apk.support/download-app
const getAppDetailsFromGooglePlay = (page: Page, packageName: string) =>
  new Promise<AppDetails>(async (resolve, reject) => {
    try {
      const link = `https://play.google.com/store/apps/details?id=${packageName}&hl=en`;
      debug('using link ' + link);
      await page.goto(link, { waitUntil: 'domcontentloaded' });

      debug('page loaded');

      // first check if thereis an error
      const maybeError = await BrowserUtils.getTextContent(page, '#error-section');

      if (!!maybeError && maybeError.toLowerCase().indexOf('not found on this server') != -1) {
        debug('got error: ' + maybeError);
        // we have an error
        return reject(new Error('the app is not found or package name is invalid'));
      }

      const initialDetails = await scrapeAppDetailsData(page, false);

      //click on details button to load 'about this app' dialog
      await page.click(
        '.qZmL0 > c-wiz:nth-child(2) > div:nth-child(1) > section:nth-child(1) > header:nth-child(1) > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)'
      );

      const appDetailsDialogSelector = `.jgIq1`;
      await page.waitForSelector(appDetailsDialogSelector);

      const aboutAppDialogDetails = await scrapeAppDetailsData(page, true);

      const appDetails: AppDetails = {
        ...initialDetails!,
        ...aboutAppDialogDetails!,
        packageName,
      };

      resolve(appDetails);
    } catch (e) {
      debug('getAppDetailsFromGooglePlay:e::');
      reject(new Error('Failed to extract date from google play'));
    }
  });

const scrapeAppDetailsData = async (page: Page, scrapeFromDialog: boolean): Promise<AppDetails | undefined> => {
  const appDetails: AppDetails = {} as any;
  for (let detailsItemKey of APP_DETAILS_KEYS) {
    const selectorItem = APP_DETAILS_SELECTORS[detailsItemKey];

    if (scrapeFromDialog && !selectorItem.getFromAppDetailsDialog) continue;
    try {
      debug('attempting to get', selectorItem.selector);
      let value: SelectorResultType;
      if (selectorItem.manyValues) {
        value = await scrapeMultipleStringValue(page, selectorItem);
      } else if (selectorItem.selector instanceof Array) {
        value = await scrapSingleStringValueWithManySelectors(
          page,
          selectorItem.type,
          selectorItem.selector,
          selectorItem.format!
        );
      } else {
        value = await scrapSingleStringValue(page, selectorItem.type, selectorItem.selector);
      }
      if (!!value && typeof value == 'string') {
        value = transformStringValue(selectorItem, value);
      }
      appDetails[detailsItemKey] = value;
    } catch (e) {
      debug('scrapeAppDetailsData:error::', e);
    }
  }
  return appDetails;
};

const scrapSingleStringValue = async (
  page: Page,
  type: DataToScrapeType,
  selector: string
): Promise<string | undefined> => {
  switch (type) {
    case DataToScrapeType.HREF: {
      return await BrowserUtils.getHref(page, selector);
    }
    case DataToScrapeType.SRC: {
      return await BrowserUtils.getSrc(page, selector);
    }
    case DataToScrapeType.TEXT_CONTENT: {
      return await BrowserUtils.getTextContent(page, selector);
    }
  }
};

const scrapSingleStringValueWithManySelectors = async (
  page: Page,
  type: DataToScrapeType,
  selectors: string[],
  format: Format
): Promise<string | undefined> => {
  switch (format) {
    case Format.DATE: {
      for (let selector of selectors) {
        const value = await scrapSingleStringValue(page, type, selector);
        if (isValidDate(value)) {
          return value;
        }
      }
    }
  }
  return undefined;
};
const scrapeMultipleStringValue = async (page: Page, itemSelector: AppDetailsSelector): Promise<string[]> => {
  let iteration = 0;
  let data: string[] = [];
  const maxIteration = itemSelector.multipleMaxCount || 20;
  while (iteration < maxIteration) {
    const selector = (itemSelector.selector as string).replace(SELECTOR_MULTIPLE_INDEX, iteration + '');
    if (!BrowserUtils.elementExist(page, selector)) {
      break;
    }
    switch (itemSelector.type) {
      case DataToScrapeType.SRC: {
        data.push((await BrowserUtils.getSrc(page, selector)) || '');
        break;
      }
      case DataToScrapeType.HREF: {
        data.push((await BrowserUtils.getHref(page, selector)) || '');
        break;
      }
      case DataToScrapeType.TEXT_CONTENT: {
        data.push((await BrowserUtils.getTextContent(page, selector)) || '');
        break;
      }
    }
    iteration++;
  }
  return data.filter((item) => !!item && item.length > 0);
};

const transformStringValue = (itemSelector: AppDetailsSelector, value: string) =>
  !!itemSelector.transform ? itemSelector.transform[value] || value : value;

/**
 * //todo: move to Browser utils
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

export const getAppDetails = async (packageName: string, closeBrowser = false): Promise<AppDetails | undefined> => {
  const page = await getChromiumPage();

  let appDetails: AppDetails;
  try {
    // try from source 1 (1 attempt)
    appDetails = await getAppDetailsFromGooglePlay(page, packageName);
    if (!!page) await page.close();
    if (closeBrowser && !!browser) {
      await browser.close();
      browser = undefined;
    }
    return appDetails;
  } catch (e1) {
    debug(e1);
    debug('failed to get app details');

    if (!!page) await page.close();
    if (closeBrowser && !!browser) {
      await browser.close();
      browser = undefined;
    }

    console.log('failed to get app details');
    return undefined;
  }
};
