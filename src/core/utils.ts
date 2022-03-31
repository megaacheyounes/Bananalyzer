'use strict';

import fs, { copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import stream from 'node:stream';
import { promisify } from 'node:util';

import debugModule from 'debug';
import os from 'os';
import path from 'path';

import { readManifest } from './apkreader/apkreader';
// import DecompressZip from 'decompress-zip';
import { APP_DATA_FOLDER, ERR_LOG_FILE, LOG_FOLDER, OUT_LOG_FILE, TEMP_FOLDER } from '../consts';
import { Manifest } from '../models/manifest';

const DecompressZip = require('decompress-zip');

const got = require('got');

const debug = debugModule('');

// remove styling
const cleanLogs = (buffer: Uint8Array | string) => `${buffer}`.replace(/\[(.*?)m/g, '').replace(/\[(.*?)m/g, '');
/**
 * print console output and nodejs errors into files
 * console outut goes to out.log
 * uncaught erros goes to err.og
 */
export const printLogs = () => {
  const errFile = ERR_LOG_FILE;
  const outFile = OUT_LOG_FILE;
  if (!fs.existsSync(LOG_FOLDER)) {
    fs.mkdirSync(LOG_FOLDER);
  }
  if (!fs.existsSync(errFile)) {
    fs.writeFileSync(errFile, '');
  }
  if (!fs.existsSync(outFile)) {
    fs.writeFileSync(outFile, '');
  }

  const stdout = process.stdout.write as any;
  const stderr = process.stderr as any;

  stdout.write_orig = stdout.write;

  stdout.write = (buffer: Uint8Array | string) => {
    fs.appendFileSync(outFile, cleanLogs(buffer), 'utf-8');
    stdout.write_orig(buffer);
  };

  stderr.write_orig = stderr.write;
  stderr.write = (buffer: Uint8Array | string) => {
    fs.appendFileSync(errFile, cleanLogs(buffer), 'utf-8');
    stderr.write_orig(buffer);
  };
};

/**
 * simple way to simulate a delay using await keyword
 * @param {int} millis delay in milli-seconds
 *  @return {Promise}
 */
export const delay = (millis: number) =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), millis);
  });

/**
 * use a library to read AndroidManifest.xml file that inside every APK
 * @param {string} apkPath apk path
 * @param {boolean} lookForRootApkIfFailed if true, treat apk as XAPK, look for inner APK
 * @return {Promise} json object that includs all information from manifest file
 *
 */
export const getApkInfo = (apkPath: string, lookForRootApkIfFailed = true) =>
  new Promise<Manifest>(async (resolve, reject) => {
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
    } catch (e: any) {
      let message;
      if (typeof e == 'string') message = e;
      else message = e.message;
      if (message && message.indexOf('does not contain') != -1) {
        const fileName = path.basename(apkPath);
        const destPath = path.join(APP_DATA_FOLDER, fileName);

        const apkpath2 = await getInnerApk(apkPath, destPath);
        debug('got inner apk path ' + apkpath2);
        if (lookForRootApkIfFailed) {
          resolve(await getApkInfo(apkpath2, false));
        } else {
          reject(Error('APK does not contain AndroidManifest.xml'));
        }
      } else if (message.indexOf('end of central directory record signature not found') != -1) {
        reject(Error('APK is corrupt or partially downloaded!'));
      } else reject(e);
    }
  });

// get the apk inside another apk (xapk, apks)
export const getInnerApk = (apkPath: string, destinationPath: string) =>
  new Promise<string>(async (resolve, reject) => {
    debug('looking for root APK inside ' + apkPath);
    const unzipper = new DecompressZip(apkPath);

    unzipper.on('error', function (err: Error) {
      debug('getInnerApk:Caught an error');
      debug('on erro: ' + err);
    });

    const fileName = path.basename(apkPath);
    debug('filename: ' + fileName);

    unzipper.on('extract', async (files: any[]) => {
      files = files.map((f) => f.stored || f.deflated);

      if (files.includes(fileName)) {
        // found the damn apk, move it to app data folder
        const rootApkPath = path.join(TEMP_FOLDER, fileName);
        debug(' root apk  ' + rootApkPath);

        if (existsSync(destinationPath)) rmSync(destinationPath);
        var r = readFileSync(rootApkPath);

        copyFileSync(rootApkPath, destinationPath);
        debug('moved root apk to ' + destinationPath);

        // delete all extracted files
        fs.rmSync(TEMP_FOLDER, { recursive: true });
        resolve(destinationPath);
      } else {
        // shit!
        reject(Error('Could not parse APK, what kind of APK is this?'));
      }
    });

    unzipper.extract({
      path: 'temp',
      filter: function (file: File) {
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

export const downloadFileGot = (downloadLink: string, downloadPath: string) =>
  new Promise(async (resolve, reject) => {
    const pipeline = promisify(stream.pipeline);

    await pipeline(got.stream(downloadLink), fs.createWriteStream(downloadPath));
    resolve(true);
  });

export const pause = async () => {
  console.log('');
  console.log('Press any key to exit (or slap your face with the keyboard)');

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
};
