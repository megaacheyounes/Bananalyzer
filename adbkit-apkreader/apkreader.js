/* eslint-disable require-jsdoc */
'use strict';

import ManifestParser from './parser/manifest.js';

import * as Zip from 'yauzl';
const MANIFEST = 'AndroidManifest.xml';

// it has been updated to include application meta data

// todo: use this method to get sdks versions
// const readContent = (path) => {
//   return usingFile(path, (content) => content);
// };

export const readManifest = (apk, options = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const content = await usingFile(apk, MANIFEST);
      resolve(new ManifestParser(content, options).parse());
    } catch (e) {
      reject(e);
    }
  });

const usingFile = async (apk, innerFile) =>
  new Promise(async (resolve, reject) => {
    let stream;
    try {
      stream = await getFileStream(apk, innerFile);
    } catch (e) {
      return reject(e);
    }

    const chunks = [];
    let totalLength = 0;

    const tryRead = () => {
      let chunk;
      while ((chunk = stream.read())) {
        chunks.push(chunk);
        totalLength += chunk.length;
      }
    };

    const readableListener = () => tryRead();
    const errorListener = (err) => {
      stream.destroy();
      reject(err);
    };
    const endListener = () => {
      const contentBuffer = Buffer.concat(chunks, totalLength);

      resolve(contentBuffer);
      stream.removeListener('readable', readableListener);
      stream.removeListener('error', errorListener);
      stream.removeListener('end', endListener);
    };
    stream.on('readable', readableListener);
    stream.on('error', errorListener);
    stream.on('end', endListener);
    tryRead();
  });

const _open = (apk) =>
  new Promise((resolve, reject) => {
    Zip.open(apk, { lazyEntries: true }, (err, zipFile) => {
      if (err) reject(err);
      else resolve(zipFile);
    });
  });

const getFileStream = (apk, innerFile) =>
  new Promise(async (resolve, reject) => {
    let zipfile;
    try {
      zipfile = await _open(apk);
    } catch (e) {
      return reject(e);
    }

    zipfile.on('entry', (entry) => {
      // called once for every file inside the apk

      if (entry.fileName === innerFile) {
        // we got the manifest file
        zipfile.openReadStream(entry, (err, stream) => {
          if (err) reject(err);
          else {
            resolve(stream);
            zipfile.removeAllListeners();
            zipfile.close();
          }
        });
      } else zipfile.readEntry(); // read next file
    });

    zipfile.on('error', (err) => {
      reject(err);
      return true;
    });

    zipfile.on('end', () => {
      reject(new Error(`APK does not contain '${innerFile}'`));
    });

    zipfile.readEntry();
  });

export default readManifest;
