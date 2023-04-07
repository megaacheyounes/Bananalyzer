import { APK } from '../utils/models/apk';
import { ApkDownloadInfo } from '../utils/models/storeInfo';
/**
 * this function will try to download an apk for app represted by @param packageName,
 * sometimes we may get rate limited, therefore this function will call it self (recursive call) again if it detects rate limit, one every minute, 10 times max
 * @param {string} packageName the package name of the app
 * @param {number} attempt attempt number
 *
 * @return {Promise}
 */
export declare const downloadAPK: (packageName: string, useExisting: boolean) => Promise<APK>;
export declare const getDownloadLink: (packageName: string, mergeSplitApk?: boolean) => Promise<ApkDownloadInfo | undefined>;
/**
 * this function will try to find and lunch chrome, if that fails it will try to download it and open it again
 * if chrome keeps failing to lunch, this function will give up after 3 attempts, and probably move to another place where it will start a new life as a vegan transgender
 */
export declare const downoadChromiumIfMissing: () => Promise<boolean>;
/**
 * we are done downloading, tell puppeteer to close browser and releaase resources blah blah
 */
export declare const closeBrowser: () => Promise<void>;
