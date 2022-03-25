'use strict';
/**
 *
 * it download apps from playstore using puppeteer and the website https://apps.evozi.com/apk-downloader
 * (this script is identical to ./downloader.js, except it uses a different website which i found faster and more reliable)
 */

/** SHIT:START please ignore this shit, its a workaround for PKG (.exe generator)  */
// import 'puppeteer-extra-plugin-stealth/evasions/chrome.app';
// import 'puppeteer-extra-plugin-stealth/evasions/chrome.csi';
// import 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes';
// import 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime';
// import 'puppeteer-extra-plugin-stealth/evasions/defaultArgs'; // pkg warned me this one was missing
// import 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow';
// import 'puppeteer-extra-plugin-stealth/evasions/media.codecs';
// import 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency';
// import 'puppeteer-extra-plugin-stealth/evasions/navigator.languages';
// import 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions';
// import 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins';
// import 'puppeteer-extra-plugin-stealth/evasions/navigator.vendor';
// import 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver';
// import 'puppeteer-extra-plugin-stealth/evasions/sourceurl';
// import 'puppeteer-extra-plugin-stealth/evasions/user-agent-override';
// import 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor';
// import 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions';
/** SHIT:END*/

import { default as puppeteer } from 'puppeteer-extra';
import { default as adblockerPlugin } from 'puppeteer-extra-plugin-adblocker';
import { default as stealthPlugin } from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import * as path from 'path';

import { delay, downloadFileGot } from './utils.js';

import debugModule from 'debug';
const debug = debugModule('downloader');

import * as downloadChromium from 'download-chromium';

// folder where the APKs will be stored
const DOWNLOAD_FOLDER = 'downloads';
// max number of attempts of downloading an apk from source 2, there is one minute delay between each attempt
const MAX_ATTEMPTS_COUNT = 2;

// use one browser
let browser;

// block ads and tracker to speed page loading
puppeteer.use(adblockerPlugin({ blockTrackers: true }));

// trying to hide that we are using a headless browser
puppeteer.use(stealthPlugin());
// download from https://apk.support/download-app
const getDownloadLink1 = (page, packageName) =>
  new Promise(async (resolve, reject) => {
    try {
      debug('getDownloadLink1 => ' + packageName);
      const link = 'https://apk.support/apk-downloader';
      debug('using link ' + link);
      await page.goto(link, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[name=package]');
      debug('page loaded');

      await page.$eval('input[name=package]', (el, packageName) => (el.value = packageName), packageName);

      debug('set package name');

      await page.click('#apksubmit');
      debug('clicked submit');

      // wait for download link or error, can take up to 60 seconds
      await page.waitForSelector('#downloader_area b , #downloader_area .dvContents', { timeout: 60 * 1000 });

      // await page.waitForSelector(".dvContents", { timeout: 60 * 1000 })
      debug('page finished fetching apk info');

      // first check if thereis an error
      const text = await page.$eval('#downloader_area', (el) => (el ? el.innerText : 'el is null'));

      if (text.toLowerCase().indexOf('not found or invalid') != -1) {
        debug('got error: ' + text);
        // we have an error
        return reject(Error('the requested app is not found or invalid'));
      }

      // we got apk info and download link
      const apkSizeEl = await page.$('.dvContents a span');
      const apkSize = await page.evaluate((el) => (el ? el.textContent : ''), apkSizeEl);

      const versionRegex = /\"VersionName\": \"(.*)\"/;
      // get app version name
      const apkInfoJson = await page.$eval('#downloader_area ul', (el) => el.innerText);

      let versionName = '';
      const versionNameMatchRes = apkInfoJson.match(versionRegex);

      if (!!versionNameMatchRes && versionNameMatchRes.length > 1) versionName = versionNameMatchRes[1];

      const uploadDateRegex = /UploadDate\"\: \"(.*)\"/;
      let uploadDate = '';
      const uploadDateMatchRes = apkInfoJson.match(uploadDateRegex);
      if (!!uploadDateMatchRes && uploadDateMatchRes.length > 1) uploadDate = uploadDateMatchRes[1];

      debug('version from website is ', versionName);

      // let hrefs = await page.$('.down_b_area .browser a')
      const downloadLink = await page.$eval('.dvContents a', (el) => {
        return el.href;
      });

      resolve({
        downloadLink,
        versionName,
        apkSize,
        uploadDate,
        source: 'apk.support',
      });
    } catch (e) {
      debug(e);
      reject(Error('failed to get download link'));
    }
  });

// download from https://apps.evozi.com/apk-downloader/
const getDownloadLink2 = (page, packageName, attempt = 0) =>
  new Promise(async (resolve, reject) => {
    attempt++;
    debug('getDownloadLink2 attempt#' + attempt);
    const link = `https://apps.evozi.com/apk-downloader/?id=${packageName}`;
    debug('page link ' + link);

    await page.goto(link, { waitUntil: 'domcontentloaded' });

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
      const errorMessage = await (await errrorEl.getProperty('textContent')).jsonValue();

      console.log('☹  Download Error → ', packageName, ':', errorMessage);

      if (errorMessage.indexOf('we are not able to download') != -1) {
        // can't download apk, move on
        return reject(Error(errorMessage));
      }

      const retryAfter = async (delayInMillis) => {
        if (attempt >= MAX_ATTEMPTS_COUNT) {
          reject(Error('failed to download apk ' + attempt + ' times!'));
        }
        console.log("I'm taking a nap (◡‿◡) zzZZZ");
        debug('delay ==>> ' + delayInMillis + ' millis...');

        await delay(delayInMillis);
        return resolve(await getDownloadLink2(page, packageName, attempt));
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
      reject(Error(errorMessage));

      return; // do not invoke the rest of the code
    }
    // no errors, we are good

    let apkSize = '!';
    let versionName = '!';

    const apkInfoEl = await page.$('.card-body .text-success');

    const apkInfo = (await (await apkInfoEl.getProperty('textContent')).jsonValue()).toString();
    debug('apkInfo', apkInfo);
    // ugly parsing of html text
    apkSize = apkInfo.match(/File Size:(.*)QR/)[1].trim();
    // sometimes apk info does not include version!, but we will still get it from the APK later in analyzer.js
    if (apkInfo.toLowerCase().indexOf('version:') == -1) {
      versionName = '';
    } else {
      versionName = apkInfo.match(/Version: (.*)/)[1].trim();
    }

    debug(' parsed apk info ' + versionName + ' ,' + apkSize);

    const downloadBtn = await page.$('a.btn.btn-success');
    const downloadLink = await page.evaluate((el) => (downloadLink = el.href), downloadBtn);

    if (!downloadLink || downloadLink.length < 0) {
      reject(Error('failed to get download url'));
      return;
    }
    resolve({
      downloadLink,
      versionName,
      apkSize,
      uploadDate: 'NOT FOUND',
      source: 'apps.evozi',
    });
  });
/**
 * this function will try to download an apk for app represted by @param packageName,
 * sometimes we may get rate limited, therefore this function will call it self (recursive call) again if it detects rate limit, one every minute, 10 times max
 * @param {string} packageName the package name of the app
 * @param {number} attempt attempt number
 *
 * @return {Promise}
 */
export const downloadAPK = (packageName) =>
  new Promise(async (resolve, reject) => {
    debug('download APK → ' + packageName);
    // create download folder if missing
    let downloadPath = '';
    try {
      downloadPath = path.join(process.cwd(), DOWNLOAD_FOLDER);
      if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);
    } catch (e) {
      console.log("Bruhhh I coulnd't mkdir a folder!!!");
      reject(Error(e));
      return;
    }

    const filePath = path.join(downloadPath, packageName + '.apk');

    if (fs.existsSync(filePath)) {
      if (global.useExisting) console.log(`using existing apk: ${packageName}  → ${filePath}`);
      else console.log(`apk will be overwritten: ${packageName}  → ${filePath}`);

      if (global.useExisting) {
        resolve({ packageName, filePath });
        return;
      }
    }

    try {
      if (!browser) {
        browser = await puppeteer.launch({
          executablePath: global.chromiumExecPath, // comment when debugging, to use chromium thats included with pupputeer
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
      page.on('request', (request) => {
        if (request.isInterceptResolutionHandled()) {
          return;
        }
        const REQUESTS_TO_IGNORE = ['font', 'image', 'stylesheet', 'media', 'imageset'];
        if (REQUESTS_TO_IGNORE.indexOf(request.resourceType()) !== -1) {
          return request.abort();
        }
        request.continue();
      });
      console.log('Searching for APK File → ' + packageName, '(can take up to 3 minutes!)');

      let downloadData = null;
      try {
        // try from source 1 (1 attempt)
        downloadData = await getDownloadLink1(page, packageName);
      } catch (e1) {
        debug(e1);
        debug('failed to get download link from source1');
        // try again from source 2 (3 attempts)
        try {
          downloadData = await getDownloadLink2(page, packageName);
          debug('got download link from source 2');
        } catch (e2) {
          debug(e2);
          reject(Error('failed to get download link'));
          return; // do not execute the rest of the code
        }
      }

      if (downloadData == null || downloadData.downloadLink == null || downloadData.downloadLink.length == 0) {
        return reject(Error('failed to get download link'));
      }
      const { downloadLink, versionName, apkSize, uploadDate, source } = downloadData;

      console.log(
        `→ Downloading ${packageName} → version= ${versionName}, download size = ${apkSize ? apkSize : '? Mb'} `
      );

      console.log(packageName, ' upload date: ', uploadDate);

      debug(` uplaodDate = ${uploadDate} , source=${source} `);
      debug('file path: ' + filePath);
      debug('download link: ' + downloadLink);

      await downloadFileGot(downloadLink, filePath);
      resolve({ packageName, filePath, uploadDate });
      debug('Downlading APK file started ==>> ' + packageName);
    } catch (e) {
      debug(e);
      debug('APK file not found → ' + packageName);
      try {
        await page.close();
      } catch (e) {}
      reject(e);
    }
  });

/**
 * as the name suggestes, this function simply try to get a browser instance
 * when chromium is missing, partially downloaded or corrupted, `puppetter.launch` will throw an exception, and that when the function downloads chromium browser
 *
 * @return {Promise} true if chrom is installed and can be launched, false otherwise
 */
const attemptToOpenOrDownloadChrome = () =>
  new Promise(async (resolve, reject) => {
    global.chromiumExecPath = path.join(
      process.cwd(),
      '.local-chromium',
      `chromium-win64-${CHROMIUM_REVISION}`,
      'chrome-win',
      'chrome.exe'
    );
    global.chromiumInstallPath = path.join(process.cwd(), '.local-chromium');

    try {
      const browser = await puppeteer.launch({
        executablePath: global.chromiumExecPath, // comment when debugging, to use chromium thats included with pupputeer
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
        installPath: global.chromiumInstallPath,
      }).catch((errr) => {
        debug('download-chromium failed');
        reject(Error(errr));
      });
      debug('download-chromium succeed : ' + global.chromiumExecPath);
      debug('path = ' + execPath);
      resolve(false);
    }
  });

/**
 * this function will try to find and lunch chrome, if that fails it will try to download it and open it again
 * if chrome keeps failing to lunch, this function will give up after 3 attempts, and probably move to another place where it will start a new life as a vegan transgender
 */
const CHROMIUM_REVISION = 970485;
export const downoadChromiumIfMissing = async () => {
  let chromLaunched = false;
  let attemps = 0;
  while (!chromLaunched && attemps < 3) {
    attemps++;
    chromLaunched = await attemptToOpenOrDownloadChrome();
    debug('chrom launched', chromLaunched);
  }
  if (attemps == 3) {
    console.log('3 attemps at downloading Chormium have all failed!');
    process.exit();
  }
};

/**
 * we are done downloading, tell puppeteer to close browser and releaase resources blah blah
 */
export const closeBrowser = async () => {
  if (!!browser) {
    await browser.close();
  } else {
    debug('failed to close browser');
  }
};
