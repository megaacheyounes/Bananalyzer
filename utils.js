'use strict';

import path from 'path';
import { moveFile } from './mv.js';
import * as os from 'os';

import debugModule from 'debug';

import { promisify } from 'node:util';
import stream from 'node:stream';
import fs from 'node:fs';
import got from 'got';
import { readManifest } from './adbkit-apkreader/apkreader.js';
import DecompressZip from 'decompress-zip';

const debug = debugModule('');

const TEMP_FOLDER = 'temp';
const APP_DATA_XSJ = 'appdataxsj';
const LOG_FOLDER = '.log';
const ERR_LOG_FILE = 'err.log';
const OUT_LOG_FILE = 'out.log';

const getLogFolder = () => path.join(process.cwd(), LOG_FOLDER);
const getOutLogFile = () => path.join(getLogFolder(), OUT_LOG_FILE);
const getErrLogFile = () => path.join(getLogFolder(), ERR_LOG_FILE);

// remove styling
const cleanLogs = (buffer) => `${buffer}`.replace(/\[(.*?)m/g, '').replace(/\[(.*?)m/g, '');
/**
 * print console output and nodejs errors into files
 * console outut goes to out.log
 * uncaught erros goes to err.og
 */
export const printLogs = () => {
  const errFile = getErrLogFile();
  const outFile = getOutLogFile();
  if (!fs.existsSync(getLogFolder())) {
    fs.mkdirSync(getLogFolder());
  }
  if (!fs.existsSync(errFile)) {
    fs.writeFileSync(errFile, '');
  }
  if (!fs.existsSync(outFile)) {
    fs.writeFileSync(outFile, '');
  }
  process.stdout.write_orig = process.stdout.write;

  process.stdout.write = (buffer) => {
    fs.appendFileSync(outFile, cleanLogs(buffer), 'utf-8');
    process.stdout.write_orig(buffer);
  };
  process.stderr.write_orig = process.stderr.write;
  process.stderr.write = (buffer) => {
    fs.appendFileSync(errFile, cleanLogs(buffer), 'utf-8');
    process.stderr.write_orig(buffer);
  };
};

/**
 * simple way to simulate a delay using await keyword
 * @param {int} millis delay in milli-seconds
 *  @return {Promise}
 */
export const delay = (millis) =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), millis);
  });

/**
 * use a library to read AndroidManifest.xml file that inside every APK
 * @param {string} apkPath apk path
 * @param {boolean} lookForRootApkIfFailed if true, treat apk as XAPK, look for inner APK
 * @return {Promise} json object that includs all information from manifest file
 *
 */
export const getApkInfo = (apkPath, lookForRootApkIfFailed = true) =>
  new Promise(async (resolve, reject) => {
    // local fork (lol) of adbkit-apkreader with support to read meta data
    // const ApkReader = require('./adbkit-apkreader');

    debug('parsing ' + apkPath + ' look for root apk= ' + lookForRootApkIfFailed);
    if (!fs.existsSync(apkPath)) {
      debug(apkPath + ' does not exist');
      return reject(Error(apkPath + ' does not exists!'));
    }

    try {
      const manifest = await readManifest(apkPath);
      resolve(manifest);
    } catch (e) {
      if (e.message.indexOf('does not contain') != -1) {
        const apkpath2 = await getInnerApk(apkPath);
        debug('got inner apk path ' + apkpath2);
        if (lookForRootApkIfFailed) {
          resolve(await getApkInfo(apkpath2, false));
        } else {
          reject(Error('APK does not contain AndroidManifest.xml'));
        }
      } else if (e.message.indexOf('end of central directory record signature not found') != -1) {
        reject(Error('APK is corrupt or partially downloaded!'));
      } else reject(e);
    }
  });

// get the apk inside another apk (xapk, apks)
export const getInnerApk = (apkPath) =>
  new Promise(async (resolve, reject) => {
    debug('looking for root APK inside ' + apkPath);
    const unzipper = new DecompressZip(apkPath);

    unzipper.on('error', function (err) {
      debug('getInnerApk:Caught an error');
      debug('on erro: ' + err);
    });

    const fileName = path.basename(apkPath);
    debug('filename: ' + fileName);
    unzipper.on('extract', async (files) => {
      files = files.map((f) => f.stored);
      if (files.includes(fileName)) {
        // found the damn apk, move it to app data folder
        const rootApkPath = path.join(TEMP_FOLDER, fileName);
        debug(' root apk  ' + rootApkPath);
        const destPath = path.join(APP_DATA_XSJ, fileName);
        debug('moved root apk to ' + APP_DATA_XSJ);
        await moveFile(rootApkPath, destPath);
        // delete all extracted files
        // todo: use rm instead
        fs.rmdirSync(TEMP_FOLDER, { recursive: true });
        resolve(destPath);
      } else {
        // shit!
        reject(Error('What kind of APK is this?'));
      }
    });

    unzipper.extract({
      path: 'temp',
      filter: function (file) {
        return file.type !== 'SymbolicLink';
      },
    });
  });

export const currentPlatform = () => {
  const p = os.platform();
  if (p === 'darwin') return 'mac';
  if (p === 'linux') return 'linux';
  if (p === 'win32') return os.arch() === 'x64' ? 'win64' : 'win32';
  return '';
};

export const downloadFileGot = (downloadLink, downloadPath) =>
  new Promise(async (resolve, reject) => {
    const pipeline = promisify(stream.pipeline);

    await pipeline(got.stream(downloadLink), fs.createWriteStream(downloadPath));
    resolve();
    // // For POST, PUT, PATCH, and DELETE methods, `got.stream` returns a `stream.Writable`.
    // await pipeline(
    //   fs.createReadStream('index.html'),
    //   got.stream.post('https://sindresorhus.com'),
    //   new stream.PassThrough()
    // );
  });

export const pause = async () => {
  console.log('');
  console.log('Press any key to exit (or slap your face with the keyboard)');

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
};
