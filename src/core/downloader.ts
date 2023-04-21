/**
 *
 * it download apps from playstore using puppeteer and the website https://apps.evozi.com/apk-downloader
 * (this script is identical to ./downloader.ts, except it uses a different website which i found faster and more reliable)
 */
import debugModule from 'debug';
import fs from 'fs';
import path from 'path';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';

import { CHROMIUM_EXEC_PATH, CHROMIUM_INSTALL_PATH, CHROMIUM_REVISION, DOWNLOAD_FOLDER } from '../consts';
import { APK } from '../models/apk';
import { ApkSource, ApkDownloadInfo } from '../models/storeInfo';
import BrowserUtils from '../utils/browserUtils';
import { delay, downloadFileGot } from './utils';

const debug = debugModule('bananalyzer:downloader');

const downloadChromium = require('download-chromium');

// max number of attempts of downloading an apk from source 2, there is one minute delay between each attempt
const MAX_ATTEMPTS_COUNT = 2;

// use one browser
let browser: undefined | Browser;

// block ads and tracker to speed page loading
// puppeteer.use(adblockerPlugin({ blockTrackers: true }));

// trying to hide that we are using a headless browser
//fixme: causes errors when building .exe
// puppeteer.use(stealthPlugin());
// download from https://apk.support/download-app
const getDownloadLink1 = (page: Page, packageName: string, mergeSplitApk: boolean) =>
  new Promise<ApkDownloadInfo>(async (resolve, reject) => {
    try {
      debug('getDownloadLink1 => ' + packageName);
      const link = 'https://apk.support/apk-downloader';
      debug('using link ' + link);
      await page.goto(link, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[name=package]');
      debug('page loaded');

      await page.$eval('input[name=package]', (el: any, packageName) => (el.value = packageName), packageName);

      debug('set package name');

      await page.click('#apksubmit');
      debug('clicked submit');

      // wait for download link or error, can take up to 60 seconds
      await page.waitForSelector('.linkarea_contents', { timeout: 60 * 1000 });

      // await page.waitForSelector(".dvContents", { timeout: 60 * 1000 })
      debug('page finished fetching apk info');

      // first check if thereis an error
      const maybeError = await page.$eval('#downloader_area', (el: any) => (el ? el.innerText : 'el is null'));

      if (maybeError.toLowerCase().indexOf('not found or invalid') != -1) {
        debug('got error: ' + maybeError);
        // we have an error
        return reject(new Error('the requested app is not found or invalid'));
      }

      const storeInfo: ApkDownloadInfo = {
        packageName,
        source: ApkSource.APK_SUPPORT,
      };

      const mergeApkButtonSelector = '#zipapk';
      const splitApkEl = await page.$(mergeApkButtonSelector);

      if (!!splitApkEl && mergeSplitApk) {
        await page.click(mergeApkButtonSelector);
        // wait for merged apk download link
        const apkLinkSelector = '#zip_area > a';
        await page.waitForSelector(apkLinkSelector, { timeout: 60 * 1000 });

        const apkDownloadLink = await BrowserUtils.getHref(page, apkLinkSelector);

        const apkSizeSelector = '#zip_area > a > span:nth-child(3)';
        const apkDownloadSize = await BrowserUtils.getTextContent(page, apkSizeSelector);

        storeInfo.downloadLink = apkDownloadLink;
        storeInfo.apkSize = apkDownloadSize;
      } else {
        const firstLinkSelector = '#sse > div:nth-child(1) > a';
        const firstLinkHref = await BrowserUtils.getHref(page, firstLinkSelector);
        storeInfo.downloadLink = firstLinkHref;

        // we got apk info and download link
        const firstApkSizeSelector = '#sse > div:nth-child(1) > a > span.der_size';
        storeInfo.apkSize = await BrowserUtils.getTextContent(page, firstApkSizeSelector);
      }

      const versionNameSelector = '#downloader_area > div.jinfo > ul > li:nth-child(5)';
      const versionNameText = await BrowserUtils.getTextContent(page, versionNameSelector);
      if (!!versionNameText) {
        const versionRegex = /\"(Version Name|VersionName)\": \"(.*)\"/;
        const versionNameMatchRes = versionNameText.match(versionRegex);

        if (!!versionNameMatchRes && versionNameMatchRes.length > 1) storeInfo.versionName = versionNameMatchRes[2];
        debug('version from website is ', storeInfo.versionName);
      }

      const uploadDateSelector = '#downloader_area > div.jinfo > ul > li:nth-child(7)';
      const uploadDateText = await BrowserUtils.getTextContent(page, uploadDateSelector);
      if (!!uploadDateText) {
        const uploadDateRegex = /(Updated on|UploadDate)\"\: \"(.*)\"/;

        const uploadDateMatchRes = uploadDateText.match(uploadDateRegex);
        if (!!uploadDateMatchRes && uploadDateMatchRes.length > 1) storeInfo.uploadDate = uploadDateMatchRes[2];
      }

      // let hrefs = await page.$('.down_b_area .browser a')
      // storeInfo.downloadLink = await page.$eval('.dvContents a', (el: any) => {
      //   return el.href;
      // });

      resolve(storeInfo);
    } catch (e) {
      debug(e);
      reject(new Error('failed to get download link'));
    }
  });

// download from https://apps.evozi.com/apk-downloader/
const getDownloadLink2 = (page: Page, packageName: string, attempt = 0) =>
  new Promise<ApkDownloadInfo>(async (resolve, reject) => {
    attempt++;
    debug('getDownloadLink2 attempt#' + attempt);
    const link = `https://apps.evozi.com/apk-downloader/?id=${packageName}`;
    debug('page link ' + link);

    try {
      await page.goto(link, { waitUntil: 'domcontentloaded' });
    } catch (e) {
      debug(e);
      return reject(new Error('no Internet'));
    }
    await page.waitForSelector('.card-body .btn');
    debug('page loaded');

    await page.click('.card-body .btn');
    debug('generate download link btn clicked');

    // we have to wait up to 3 min, we either get the downlaod url or an error
    await page.waitForSelector('#apk_info .text-success,.text-danger', { timeout: 60_000 * 3 });
    debug('apk info loaded');

    // check if we got an error
    const errrorEl = await page.$('#apk_info .text-danger');
    if (!!errrorEl) {
      debug('GOT ERROR while waiting for apk info');
      const errorMessage: string = await (await errrorEl.getProperty('textContent')).jsonValue();

      console.log('☹  Download Error → ', packageName, ':', errorMessage);

      if (errorMessage.indexOf('we are not able to download') != -1) {
        // can't download apk, move on
        return reject(new Error(errorMessage));
      }

      const retryAfter = async (delayInMillis: number) => {
        if (attempt >= MAX_ATTEMPTS_COUNT) {
          reject(new Error('failed to download apk ' + attempt + ' times!'));
        }
        console.log("I'm taking a nap (◡‿◡) zzZZZ");
        debug('delay ==>> ' + delayInMillis + ' millis...');

        await delay(delayInMillis);
        resolve(await getDownloadLink2(page, packageName, attempt));
        return;
      };
      // some error message
      if (errorMessage.toLowerCase().indexOf('rate limit') != -1) {
        // you got your ass rate limited!

        // example message 1 = "Rate limit exceeded, please try again in 1 minute."
        // example message 1 = "Rate limit exceeded, please try again in 3.7 minutes. (Take a short rest and come back later)"
        // try to get timeout from error message
        const timeout = +errorMessage.replace(/[^\d\.]*/g, '').replace(/\.$/, ''); // in minutes
        debug('timeout = ' + timeout);
        if (isNaN(timeout)) {
          // failed to parse number of minute from message
          // let just wait a minute
          await retryAfter(60 * 1_000);
        } else {
          await retryAfter(timeout * 60 * 1_000);
        }
      } else if (errorMessage.toLowerCase().indexOf('invalid token') != -1) {
        // ugghh we have to refresh to page
        // error message example = "Expired or Invalid Token, Please refresh the page and try again"
        return retryAfter(1000);
      }

      // package name is probabely wrong or invalid
      reject(new Error(errorMessage));

      return; // do not invoke the rest of the code
    }
    // no errors, we are good

    const storeInfo: ApkDownloadInfo = {
      packageName,
      source: ApkSource.APPS_EVOZI,
    };

    const apkInfoEl = await page.$('.card-body .text-success');
    if (apkInfoEl != null) {
      const apkInfoTextContent = (await apkInfoEl.getProperty('textContent')).jsonValue();
      const apkInfo: string = apkInfoTextContent.toString();
      debug('apkInfo', apkInfo);

      const sizeMatch = apkInfo.match(/File Size:(.*)QR/);
      // ugly parsing of html text
      if (sizeMatch != null) storeInfo.apkSize = sizeMatch[1].trim();

      // sometimes apk info does not include version!, but we will still get it from the APK later in analyzer.ts
      if (apkInfo.toLowerCase().indexOf('version:') == -1) {
        storeInfo.versionName = '';
      } else {
        const versionMatch = apkInfo.match(/Version: (.*)/);
        if (versionMatch != null) storeInfo.versionName = versionMatch[1].trim();
      }
    }

    debug(' parsed apk info ' + storeInfo.versionName + ' ,' + storeInfo.apkSize);

    const downloadLink = await page.$eval('a.btn.btn-success', (el: any) => el.href);

    if (!downloadLink || downloadLink.length < 0) {
      reject(new Error('failed to get download url'));
      return;
    }
    storeInfo.downloadLink = downloadLink;
    resolve(storeInfo);
  });

/**
 * return chromium tab object (page)
 * @param {boolean} openBrowser if true, it will force create new instance of browser (usefull for tesitng)
 */
const getChromiumPage = async (openBrowser = false): Promise<Page> => {
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
    width: 390 + Math.floor(Math.random() * 100),
    height: 844 + Math.floor(Math.random() * 100),
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
 * this function will try to download an apk for app represted by @param packageName,
 * sometimes we may get rate limited, therefore this function will call it self (recursive call) again if it detects rate limit, one every minute, 10 times max
 * @param {string} packageName the package name of the app
 * @param {number} attempt attempt number
 *
 * @return {Promise}
 */
export const downloadAPK = (packageName: string, useExisting: boolean, mergeSplitApk = true, closeBrowser = false) =>
  new Promise<APK>(async (resolve, reject) => {
    debug('download APK → ' + packageName);
    // create download folder if missing

    try {
      if (!fs.existsSync(DOWNLOAD_FOLDER)) fs.mkdirSync(DOWNLOAD_FOLDER);
    } catch (e: any) {
      console.log("Bruhhh I coulnd't mkdir a folder!!!");
      reject(new Error(e));
      return;
    }

    const filePath = path.join(DOWNLOAD_FOLDER, packageName + '.apk');

    try {
      if (fs.existsSync(filePath)) {
        if (useExisting) console.log(`using existing apk: ${packageName}  → ${filePath}`);
        else console.log(`apk will be overwritten: ${packageName}  → ${filePath}`);

        if (useExisting) {
          resolve({ packageName, filePath });
          return;
        }
      }

      const downloadData = await getDownloadLink(packageName, mergeSplitApk, closeBrowser);

      if (!downloadData || !downloadData.downloadLink) {
        throw Error('failed to get download link');
      }

      const { downloadLink, versionName, apkSize, uploadDate, source } = downloadData;

      debug(` uplaodDate = ${uploadDate} , source=${source} `);
      debug('file path: ' + filePath);
      debug('download link: ' + downloadLink);

      // todo: remove
      // if (fs.existsSync(filePath)) {
      //   if (useExisting) console.log(`using existing apk: ${packageName}  → ${filePath}`);
      //   else console.log(`apk will be overwritten: ${packageName}  → ${filePath}`);

      //   if (useExisting) {
      //     resolve({ packageName, filePath, uploadDate });
      //     return;
      //   }
      // }

      console.log(
        `→ Downloading ${packageName} → version= ${versionName}, download size = ${apkSize ? apkSize : '? Mb'} `
      );
      try {
        await downloadFileGot(downloadLink, filePath);
      } catch (e) {
        return reject(e);
      }
      console.log('✓ APK file is ready → ' + packageName);
      resolve({ packageName, filePath, uploadDate, versionName, size: apkSize });
      debug('Downlading APK file started ==>> ' + packageName);
    } catch (e) {
      debug(e);
      debug('APK file not found → ' + packageName);

      reject(e);
    }
  });

export const getDownloadLink = async (
  packageName: string,
  mergeSplitApk = true,
  closeBrowserWhenDone = false
): Promise<ApkDownloadInfo | undefined> => {
  const page = await getChromiumPage();
  console.log('Searching for APK File → ' + packageName, '(can take up to 3 minutes!)');

  let downloadData: ApkDownloadInfo;
  try {
    // try from source 1 (1 attempt)
    downloadData = await getDownloadLink1(page, packageName, mergeSplitApk);
    if (!!page) await page.close();
    if (closeBrowserWhenDone) await closeBrowser();

    return downloadData;
  } catch (e1) {
    debug(e1);
    debug('failed to get download link from source1');
    // try again from source 2 (3 attempts)
    // try {
    //   downloadData = await getDownloadLink2(page, packageName);
    //   debug('got download link from source 2');
    // } catch (e2) {
    //   debug(e2);
    if (!!page) await page.close();
    if (closeBrowserWhenDone) await closeBrowser();

    throw new Error('failed to get download link');

    //   }
  }
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
