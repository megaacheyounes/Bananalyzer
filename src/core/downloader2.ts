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
import { downloadFileGot } from './utils';

const debug = debugModule('bananalyzer:downloader');

// max number of attempts of downloading an apk from source 2, there is one minute delay between each attempt
const MAX_ATTEMPTS_COUNT = 2;

// block ads and tracker to speed page loading
// puppeteer.use(adblockerPlugin({ blockTrackers: true }));

// trying to hide that we are using a headless browser
//fixme: causes errors when building .exe
// puppeteer.use(stealthPlugin());
// download from https://apk.support/download-app
const getDownloadLink = (page: Page, packageName: string, mergeSplitApk: boolean) =>
  new Promise<ApkDownloadInfo>(async (resolve, reject) => {
    try {
      debug('getDownloadLink1 => ' + packageName);
      const link = 'https://apk.support/download-app/' + packageName;
      debug('using link ' + link);
      await page.goto(link, { waitUntil: 'networkidle0' });

      debug('page loaded');

      const maybeErrorEl = await BrowserManager.getTextContent(page, "#pageapp > div.box > div.box-header > div")
      if (!!maybeErrorEl) {
        debug("error 404")
        await page.screenshot({
          path: packageName + ".png"
        })
        return reject(new Error('the requested app is not found or invalid'));
      }

      const storeInfo: ApkDownloadInfo = {
        packageName,
        source: ApkSource.APK_SUPPORT,
      };

      let dlLink1 = await BrowserManager.getHref(page, "#ogdl > a")

      if (!!dlLink1) {

        storeInfo.apkSize = await BrowserManager.getTextContent(page, "#ogdl > a > div > div.dinfo > div:nth-child(2) > span.dsizeinfo")
        storeInfo.downloadLink = dlLink1

        const nameAndVersion = await BrowserManager.getTextContent(page, "#ogdl > a > div > div.dinfo > div:nth-child(1) > span")
        storeInfo.uploadDate = "latest**"
        storeInfo.versionName = nameAndVersion.split(" ").pop()

        debug(storeInfo)
        debug("done")
        resolve(storeInfo);
        return;
      }

      await page.click('#apksubmit');
      debug("clicked submit")
      try {
        // wait for download link or error, can take up to 30 seconds
        await page.waitForSelector('#sse > div > a', { timeout: 30 * 1000 });
      } catch (e) {
        await page.screenshot({
          path: packageName + "_after-sumbmit" + ".png"
        })
        return reject('Timeout error while looking for the app');
      }

      debug('page finished fetching apk info');

      const mergeApkButtonSelector = '#zipapk';
      const mergeBtn = await page.$(mergeApkButtonSelector);

      if (!!mergeBtn && mergeSplitApk) {
        debug("merging apk...")
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
        const versionNameMatchRes = versionNameText.match(versionRegex) as any;

        if (!!versionNameMatchRes && versionNameMatchRes.length > 1) storeInfo.versionName = versionNameMatchRes[2];
        debug('version from website is ', storeInfo.versionName);
      }

      const uploadDateSelector = '#downloader_area > div.appinfo > div.appinfo_i > div.appinfo_vd';
      const versionDateTxt = await BrowserManager.getTextContent(page, uploadDateSelector);
      if (!!versionDateTxt) {
        storeInfo.uploadDate = versionDateTxt.split('-').pop()?.trim() || ""
      }

      resolve(storeInfo);
    } catch (e) {
      debug(e);
      reject(new Error('failed to get download link'));
    }
  });

/**
 * this function will try to download an apk for app represted by @param packageName,
 * sometimes we may get rate limited, therefore this function will call it self (recursive call) again if it detects rate limit, one every minute, 10 times max
 * @param {string} packageName the package name of the app
 * @param {number} attempt attempt number
 *
 * @return {Promise}
 */
export const downloadAPK2 = (packageName: string, useExisting: boolean, mergeSplitApk = true, closeBrowser = false) =>
  new Promise<APK>(async (resolve, reject) => {
    debug('download APK → ' + packageName);
    // create download folder if missing

    try {
      if (!fs.existsSync(DOWNLOAD_FOLDER)) fs.mkdirSync(DOWNLOAD_FOLDER);
    } catch (e: any) {
      console.log("Bruhhh I coulnd't mkdir!!!");
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

      const downloadData = await getDownloadLink2(packageName, mergeSplitApk, closeBrowser);

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

export const getDownloadLink2 = async (
  packageName: string,
  mergeSplitApk = true,
  closeBrowserWhenDone = false
): Promise<ApkDownloadInfo | undefined> => {
  const page = await BrowserManager.getChromiumPage();
  console.log('Searching for APK File → ' + packageName, '(can take up to 3 minutes!)');

  let downloadData: ApkDownloadInfo;
  try {
    // try from source 1 (1 attempt)
    downloadData = await getDownloadLink(page, packageName, mergeSplitApk);
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
