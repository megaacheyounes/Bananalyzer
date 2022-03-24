/* eslint-disable require-jsdoc */
'use strict';

import BinaryXmlParser from './parser/binaryxml.js';
import ManifestParser from './parser/manifest.js';

// const Zip = require('yauzl');
import * as Zip from 'yauzl';

// const Promise = require('bluebird');
// import * as Promise from 'bluebird';

// const ManifestParser = require('./parser/manifest');
// const BinaryXmlParser = require('./parser/binaryxml');

/**
 * it has been updated to include application meta data
 */
class ApkReader {
  static open(apk) {
    return new Promise((resolve, reject) => {
      resolve(new ApkReader(apk));
    });
  }

  constructor(apk) {
    this.apk = apk;
  }

  _open() {
    return new Promise((resolve, reject) => {
      Zip.open(this.apk, { lazyEntries: true }, (err, zipFile) => {
        if (err) reject(err);
        else resolve(zipFile);
      });
    });
  }

  usingFile(file, action) {
    return this.usingFileStream(file, function (stream) {
      let errorListener;
      let readableListener;
      let endListener;

      const read = () =>
        new Promise((resolve, reject) => {
          const chunks = [];

          let totalLength = 0;

          const tryRead = function () {
            let chunk;
            while ((chunk = stream.read())) {
              chunks.push(chunk);
              totalLength += chunk.length;
            }
          };

          readableListener = () => tryRead();
          errorListener = (err) => {
            stream.destroy();
            reject(err);
          };
          endListener = () => resolve(Buffer.concat(chunks, totalLength));

          stream.on('readable', readableListener);
          stream.on('error', errorListener);
          stream.on('end', endListener);

          tryRead();
        });

      return read()
        .then(action)
        .finally(function () {
          stream.removeListener('readable', readableListener);
          stream.removeListener('error', errorListener);
          stream.removeListener('end', endListener);
        });
    });
  }

  usingFileStream(file, action) {
    return this._open().then(function (zipfile) {
      let entryListener;
      let errorListener;
      let endListener;

      const find = () =>
        new Promise((resolve, reject) => {
          entryListener = (entry) => {
            if (entry.fileName === file) {
              // return resolve(
              // Promise.fromCallback((callback) => {
              zipfile.openReadStream(entry, (err, stream) => {
                if (err) reject(err);
                else resolve(stream);
              });
              // })
              // );
            }

            zipfile.readEntry();
          };

          endListener = () => {
            reject(new Error(`APK does not contain '${file}'`));
          };

          errorListener = (err) => reject(err);

          zipfile.on('entry', entryListener);
          zipfile.on('end', endListener);
          zipfile.on('error', errorListener);

          zipfile.readEntry();
        });

      return find()
        .then(action)
        .finally(function () {
          zipfile.removeListener('entry', entryListener);
          zipfile.removeListener('error', errorListener);
          zipfile.removeListener('end', endListener);
          zipfile.close();
        });
    });
  }

  readContent(path) {
    return this.usingFile(path, (content) => content);
  }

  readManifest(options = {}) {
    return this.usingFile(ApkReader.MANIFEST, (content) => {
      return new ManifestParser(content, options).parse();
    });
  }

  readXml(path, options = {}) {
    return this.usingFile(path, (content) => {
      return new BinaryXmlParser(content, options).parse();
    });
  }
}

ApkReader.MANIFEST = 'AndroidManifest.xml';

export default ApkReader;
