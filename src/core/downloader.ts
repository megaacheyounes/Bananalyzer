/**
 *
 * it download apps from playstore using puppeteer and the website https://apps.evozi.com/apk-downloader
 * (this script is identical to ./downloader.ts, except it uses a different website which i found faster and more reliable)
 */
import debugModule from 'debug';
import fs from 'fs';
import path from 'path';
import { Page } from 'puppeteer';

import { DOWNLOAD_FOLDER } from '../consts';
import { APK } from '../models/apk';
import { ApkDownloadInfo, ApkSource } from '../models/storeInfo';
import BrowserManager from './BrowserManager';
import { delay, downloadFileGot } from './utils';

const debug = debugModule('bananalyzer:downloader');

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
        throw Error('failed to get download link (requested app is not found or invalid)');
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
  const page = await BrowserManager.getChromiumPage();
  console.log('Searching for APK File → ' + packageName, '(can take up to 3 minutes!)');

  let downloadData: ApkDownloadInfo;
  try {
    // try from source 1 (1 attempt)
    downloadData = await getDownloadLink1(page, packageName, mergeSplitApk);
    if (!!page) await page.close();
    if (closeBrowserWhenDone) await BrowserManager.closeBrowser();

    return downloadData;
  } catch (e1) {
    debug(e1);
    debug('failed to get download link from source1');
    if (!!page) await page.close();
    if (closeBrowserWhenDone) await BrowserManager.closeBrowser();

    return undefined;

  }
};


// max number of attempts of downloading an apk from source 2, there is one minute delay between each attempt
const MAX_ATTEMPTS_COUNT = 2;

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
      await page.goto(link, { waitUntil: 'networkidle0' });
      await page.waitForSelector('input[name=package]');
      debug('page loaded');

      await page.type('input[name=package]', packageName, { delay: 30 });

      debug('set package name');

      await page.click('#apksubmit');

      try {
        // wait for download link or error, can take up to 30 seconds
        await page.screenshot({
          path: "image_1.png"
        })
        await page.waitForSelector('#downloader_area > .appinfo,#downloader_area > br', { timeout: 30 * 1000 });
      } catch (e) {
        await page.screenshot({
          path: "image_2.png"

        })
        return reject('Timeout error while looking for the app');
      }

      debug('page finished fetching apk info');

      // first check if thereis an error
      const maybeError = await BrowserManager.getTextContent(page, '#downloader_area');
      // const maybeError = await page.$eval('#downloader_area', (el: any) => (el ? el.innerText : 'el is null'));

      const maybeErrorLowerCase = maybeError.toLowerCase()

      if (maybeErrorLowerCase.indexOf('not found or invalid') != -1 ||
        maybeErrorLowerCase.indexOf("removed from the play store") != -1) {
        debug('got error: ', maybeErrorLowerCase);
        await delay(2000)
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

        const apkDownloadLink = await BrowserManager.getHref(page, apkLinkSelector);

        const apkSizeSelector = '#zip_area > a > span:nth-child(3)';
        const apkDownloadSize = await BrowserManager.getTextContent(page, apkSizeSelector);

        storeInfo.downloadLink = apkDownloadLink;
        storeInfo.apkSize = apkDownloadSize;
      } else {
        const firstLinkSelector = '#sse > div:nth-child(1) > a';
        const firstLinkHref = await BrowserManager.getHref(page, firstLinkSelector);
        storeInfo.downloadLink = firstLinkHref;

        // we got apk info and download link
        const firstApkSizeSelector = '#sse > div:nth-child(1) > a > span.der_size';
        storeInfo.apkSize = await BrowserManager.getTextContent(page, firstApkSizeSelector);
      }

      const versionNameSelector = '#downloader_area > div.jinfo > ul > li:nth-child(5)';
      const versionNameText = await BrowserManager.getTextContent(page, versionNameSelector);
      if (!!versionNameText) {
        const versionRegex = /\"(Version Name|VersionName)\": \"(.*)\"/;
        const versionNameMatchRes = versionNameText.match(versionRegex);

        if (!!versionNameMatchRes && versionNameMatchRes.length > 1) storeInfo.versionName = versionNameMatchRes[2];
        debug('version from website is ', storeInfo.versionName);
      }

      const uploadDateSelector = '#downloader_area > div.jinfo > ul > li:nth-child(7)';
      const uploadDateText = await BrowserManager.getTextContent(page, uploadDateSelector);
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