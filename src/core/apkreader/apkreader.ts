/* eslint-disable require-jsdoc */
'use strict';

import debugModule from 'debug';
import internal from 'stream';
import * as Zip from 'yauzl';
import { ANDROID_MANIFEST } from '../../consts';

import { Manifest } from '../../models/manifest';
import ManifestParser from './manifestParser';

// it has been updated to include application meta data

const debug = debugModule('apkreader');

export const readManifest = (apk: string, options = { debug: false }) =>
  new Promise<Manifest>(async (resolve, reject) => {
    try {
      const content = await usingFile(apk, ANDROID_MANIFEST);
      debug('got manifest content');
      resolve(new ManifestParser(content, options).parse());
    } catch (e) {
      reject(e);
    }
  });

const usingFile = async (apk: string, innerFile: string) =>
  new Promise<Buffer>(async (resolve, reject) => {
    let stream: internal.Readable;
    try {
      stream = await getFileStream(apk, innerFile);
    } catch (e) {
      debug(e);
      return reject(e);
    }

    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    const tryRead = () => {
      let chunk;
      while ((chunk = stream.read())) {
        chunks.push(chunk);
        totalLength += chunk.length;
      }
    };

    const readableListener = () => tryRead();
    const errorListener = (err: any) => {
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

const _open = (apk: string) =>
  new Promise<Zip.ZipFile | undefined>((resolve, reject) => {
    Zip.open(apk, { lazyEntries: true }, (err, zipFile) => {
      if (err) {
        debug(err);
        reject(err);
      } else resolve(zipFile);
    });
  });

const getFileStream = (apk: any, innerFile: any) =>
  new Promise<internal.Readable>(async (resolve, reject) => {
    let zipfile: Zip.ZipFile;
    try {
      const zipFileTemp = await _open(apk);
      if (!zipFileTemp) {
        debug('could not open zip file');
        reject('APK corrupt or does not exist');
        return;
      }
      zipfile = zipFileTemp!!;
    } catch (e) {
      return reject(e);
    }

    zipfile.on('entry', (entry: Zip.Entry) => {
      // called once for every file inside the apk

      if (entry.fileName === innerFile) {
        // we got the manifest file
        zipfile.openReadStream(entry, (err: any, stream: internal.Readable | undefined) => {
          if (err) reject(err);
          else {
            resolve(stream!!);
            zipfile.removeAllListeners();
            zipfile.close();
          }
        });
      } else zipfile.readEntry(); // read next file
    });

    zipfile.on('error', (err: any) => {
      reject(err);
      return true;
    });

    zipfile.on('end', () => {
      reject(new Error(`APK does not contain '${innerFile}'`));
    });

    zipfile.readEntry();
  });

export default readManifest;
