import { AndroidManifest } from '../utils/models/manifest';
/**
 * print console output and nodejs errors into files
 * console outut goes to out.log
 * uncaught erros goes to err.og
 */
export declare const printLogs: () => void;
/**
 * simple way to simulate a delay using await keyword
 * @param {int} millis delay in milli-seconds
 *  @return {Promise}
 */
export declare const delay: (millis: number) => Promise<unknown>;
/**
 * use a library to read AndroidManifest.xml file that inside every APK
 * @param {string} apkPath apk path
 * @param {boolean} lookForRootApkIfFailed if true, treat apk as XAPK, look for inner APK
 * @return {Promise} json object that includs all information from manifest file
 *
 */
export declare const getApkInfo: (apkPath: string, lookForRootApkIfFailed?: boolean) => Promise<AndroidManifest>;
export declare const getInnerApk: (apkPath: string, destinationPath: string) => Promise<string>;
export declare const currentPlatform: () => "mac" | "linux" | "win64" | "win32" | "";
export declare const downloadFileGot: (downloadLink: string, downloadPath: string) => Promise<unknown>;
export declare const pause: () => Promise<void>;
