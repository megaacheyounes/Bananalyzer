import { Browser } from 'puppeteer';
/**
 * get app details from google play using puppeteer
 */
import debugModule from 'debug';
import { Page } from 'puppeteer';

import BrowserManager from '../BrowserManager';
import { isValidDate } from '../../utils/dateTimeUtils';
import { match } from 'assert';
import { delay } from '../utils';

const debug = debugModule('bananalyzer:appGalleryScraper');

// block ads and tracker to speed page loading
// puppeteer.use(adblockerPlugin({ blockTrackers: true }));

enum DataToScrapeType {
  HREF,
  SRC,
  TEXT_CONTENT,
}

const APP_DETAILS_KEYS = [
  'packageName',
  'name',
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
  'screenshots' //defined below in SelectorsType & AppDetails
] as const;

enum Format {
  DATE,
  NOT_DATE,
}

type AppDetailsSelector = {
  selector: string | string[];
  type: DataToScrapeType;
  getFromAppDetailsDialog?: boolean;
  isScreenshots?: boolean;
  startingIndex?: number;
  multipleMaxCount?: number;
  format?: Format;
  transform?: { [key: string]: string };
  extractWithRegex?: RegExp
};

type SelectorsType = {
  screenshots: AppDetailsSelector;
} & {
    [key in (typeof APP_DETAILS_KEYS)[number]]: AppDetailsSelector;
  };

type SelectorResultType = string | string[] | undefined;

type AppDetails = {
  [key in (typeof APP_DETAILS_KEYS)[number]]: SelectorResultType;
}

const SELECTOR_MULTIPLE_INDEX = '__INDEX__';

const APP_DETAILS_SELECTORS: SelectorsType = {
  packageName: { selector: '.ignore' + new Date().getTime(), type: DataToScrapeType.TEXT_CONTENT },
  name: { selector: '.center_info > div:nth-child(1)', type: DataToScrapeType.TEXT_CONTENT },
  versionName: {
    selector: '.detailInfo > div:nth-child(1) > div:nth-child(3) > div:nth-child(2)',
    type: DataToScrapeType.TEXT_CONTENT,
  },
  description: {
    selector: '.openAndHide > div:nth-child(1)',
    type: DataToScrapeType.TEXT_CONTENT,
  },
  updatedOn: {
    //*[@id="yDmH0d"]/div[6]/div[2]/div/div/div/div/div[2]/div[3]/div[9]/div[2] 
    selector: ['.detailInfo > div:nth-child(1) > div:nth-child(4) > div:nth-child(2)', 'body > div > div.box > div > div.componentContainer > div:nth-child(7) > div > div.detailInfo > div.left > div:nth-child(4) > div.info_val'],
    // selector: 'div.sMUprd:nth-child(2) > div:nth-child(2)',
    type: DataToScrapeType.TEXT_CONTENT,
    format: Format.DATE,
  },
  releasedOn: {
    selector: 'ignore',
    type: DataToScrapeType.TEXT_CONTENT,
  },
  requiresAndroid: {
    selector: 'ignore',
    type: DataToScrapeType.TEXT_CONTENT,
  },
  rating: {
    selector: '.score > span:nth-child(1)', type: DataToScrapeType.TEXT_CONTENT
  },
  downloads: { selector: '.center_info_bottom > div:nth-child(2) > span:nth-child(1)', type: DataToScrapeType.TEXT_CONTENT },
  downloadsDetails: {
    selector: 'ignore',
    type: DataToScrapeType.TEXT_CONTENT,
  },
  developer: { selector: 'div.right:nth-child(2) > div:nth-child(2) > div:nth-child(2)', type: DataToScrapeType.TEXT_CONTENT },

  reviewsNumber: {
    selector: '.commentators', type: DataToScrapeType.TEXT_CONTENT,
    extractWithRegex: new RegExp(/\d+/)
  },
  icon: {
    selector: '.left_logo',
    type: DataToScrapeType.SRC,
  },
  screenshots: {
    //div.swiper-slide:nth-child(1) > img:nth-child(1)
    //div.swiper-slide:nth-child(2) > img:nth-child(1)
    //div.swiper-slide:nth-child(3) > img:nth-child(1)
    //div.swiper-slide:nth-child(4) > img:nth-child(1)
    //div.swiper-slide:nth-child(7) > img:nth-child(1)
    selector: `div.swiper-slide:nth-child(${SELECTOR_MULTIPLE_INDEX}) > img:nth-child(1)`,
    type: DataToScrapeType.SRC,
    isScreenshots: true,
    startingIndex: 1,
    multipleMaxCount: 8,
  },
};
// trying to hide that we are using a headless browser
//fixme: causes errors when building .exe
// puppeteer.use(stealthPlugin());
// download from https://apk.support/download-app
//appId example: C107473795 or 107473795
const getAppDetails = (page: Page, appId: string) =>
  new Promise<AppDetails>(async (resolve, reject) => {
    try {
      const firstChar = appId.charAt(0)
      if (firstChar.toLocaleLowerCase() != 'c')
        return reject("Invalid AppId (AppGallery app id should look like: C107473795 or 107473795)")

      if (firstChar == 'c')
        appId.replace('c', 'C')


      const link = `https://appgallery.huawei.com/app/${appId}`;
      debug('using link ' + link);
      await page.goto(link, { waitUntil: 'networkidle0' });
      // await page.waitForNetworkIdle();
      debug('page loaded');

      const waitForSelector = ".componentContainer"

      await delay(2000)
      await page.screenshot({ path: './ag.png' })

      await page.waitForSelector(waitForSelector, {
        timeout: 10_000
      }).catch(async e => {
        await page.screenshot({ path: './ag_err.png' })
      })
      await page.screenshot({ path: './ag2.png' })

      const nameSelector = ".center_info > div:nth-child(1)"

      const title = await BrowserManager.getTextContent(page, nameSelector)
      if (!title) {
        debug("not title")
        return reject(new Error("failed to scrape data, appId might be invalid or app does not exist"))
      }


      const details = await scrapeAppDetailsData(page, false);

      const appDetails: AppDetails = {
        ...details!,
      };

      resolve(appDetails);
    } catch (e) {
      debug('getAppDetailsFromGooglePlay:e::', e);
      reject(new Error('Failed to extract data from google play'));
    }
  });

const scrapeAppDetailsData = async (page: Page, scrapeFromDialog: boolean): Promise<AppDetails | undefined> => {
  const appDetails: AppDetails = {} as any;
  for (let detailsItemKey of APP_DETAILS_KEYS) {
    const selectorItem = APP_DETAILS_SELECTORS[detailsItemKey];

    if (scrapeFromDialog && !selectorItem.getFromAppDetailsDialog) continue;
    try {
      debug('attempting to get', selectorItem.selector);

      if (selectorItem.isScreenshots) {
        debug("scrappign screenshots")
        appDetails.screenshots = await scrapeMultipleStringValue(page, selectorItem);

        continue;
      }


      let value: SelectorResultType | string[];
      if (selectorItem.selector instanceof Array) {
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

      if (!!value && !!selectorItem.extractWithRegex) {
        const matchRes = value.match(selectorItem.extractWithRegex)
        debug('value', value)
        debug('matchRes', matchRes)
        if (!!matchRes && matchRes.length > 0)
          value = matchRes[0]
      }

      appDetails[detailsItemKey] = value;
    } catch (e) {
      debug('scrapeAppDetailsData:error::', e);
    }
  }
  return appDetails;
};

const scrapSingleStringValue = async (page: Page, type: DataToScrapeType, selector: string): Promise<string> => {
  switch (type) {
    case DataToScrapeType.HREF: {
      return await BrowserManager.getHref(page, selector);
    }
    case DataToScrapeType.SRC: {
      return await BrowserManager.getSrc(page, selector);
    }
    case DataToScrapeType.TEXT_CONTENT: {
      return await BrowserManager.getTextContent(page, selector);
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
    if (!BrowserManager.elementExist(page, selector)) {
      continue;
    }
    switch (itemSelector.type) {
      case DataToScrapeType.SRC: {
        data.push((await BrowserManager.getSrc(page, selector)) || '');
        break;
      }
      case DataToScrapeType.HREF: {
        data.push((await BrowserManager.getHref(page, selector)) || '');
        break;
      }
      case DataToScrapeType.TEXT_CONTENT: {
        data.push((await BrowserManager.getTextContent(page, selector)) || '');
        break;
      }
    }
    iteration++;
  }
  return data.filter((item) => !!item && item.length > 0);
};

const transformStringValue = (itemSelector: AppDetailsSelector, value: string) =>
  !!itemSelector.transform ? itemSelector.transform[value] || value : value;

export const getAppGalleryDetails = async (packageName: string, closeBrowser = false): Promise<AppDetails | undefined> => {
  const page = await BrowserManager.getChromiumPage();

  //fixme
  // return undefined;
  let appDetails: AppDetails;
  try {
    // try from source 1 (1 attempt)
    appDetails = await getAppDetails(page, packageName);
    if (!!page) await page.close();
    if (closeBrowser) await BrowserManager.closeBrowser;
    return appDetails;
  } catch (e1) {
    debug(e1);
    debug('failed to get app details');

    if (!!page) await page.close();
    if (closeBrowser) await BrowserManager.closeBrowser();

    console.log('failed to get app details');
    return undefined;
  }
};
