'use strict';
// stolen from https://github.com/andrewrk/node-mv/edit/master/index lol
/**
 * this script helps to move files, i think!
 */
import fs from 'fs';
import mkdirp from 'mkdirp';
import ncp from 'ncp';
import path from 'path';
import rimraf from 'rimraf';

import { IS_PROD } from '../consts';

type Callback = (err: any | null) => void;

interface Options {
  mkdirp?: boolean;
  clobber?: boolean;
  limit?: number;
}

/**
 * move file
 * @param {string} source original path
 * @param {string} dest destination file path
 * @param {object} options options
 * @param {func} cb callback
 *
 */
function mv(source: string, dest: string, options: Options | Callback, cb: Callback) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  const shouldMkdirp = !!options.mkdirp;
  const clobber = options.clobber !== false;
  const limit = options.limit || 16;

  if (shouldMkdirp) {
    mkdirs();
  } else {
    doRename();
  }
  /**
   * make directory
   */
  async function mkdirs() {
    try {
      await mkdirp(path.dirname(dest));
      doRename();
    } catch (e) {
      cb(e);
    }
    // mkdirp(path.dirname(dest), (err) => {
    //   if (err) return cb(err);
    //   doRename();
    // });
  }

  /**
   * rename file/folder
   */
  function doRename() {
    if (clobber) {
      fs.rename(source, dest, function (err) {
        if (!err) return cb(null);
        if (err.code !== 'EXDEV') return cb(err);
        moveFileAcrossDevice(source, dest, clobber, limit, cb);
      });
    } else {
      fs.link(source, dest, function (err) {
        if (err) {
          if (err.code === 'EXDEV') {
            moveFileAcrossDevice(source, dest, clobber, limit, cb);
            return;
          }
          if (err.code === 'EISDIR' || err.code === 'EPERM') {
            moveDirAcrossDevice(source, dest, clobber, limit, cb);
            return;
          }
          cb(err);
          return;
        }
        fs.unlink(source, cb);
      });
    }
  }
}
/**
 *
 * @param {string} source
 * @param {string} dest
 * @param {boolean} clobber
 * @param {number} limit
 * @param {Callback} cb
 */
function moveFileAcrossDevice(source: string, dest: string, clobber: boolean, limit: number, cb: Callback) {
  const outFlags = clobber ? 'w' : 'wx';
  const ins = fs.createReadStream(source);
  const outs = fs.createWriteStream(dest, { flags: outFlags });
  ins.on('error', function (err: any) {
    ins.destroy();
    outs.destroy();
    outs.removeListener('close', onClose);
    if (err.code === 'EISDIR' || err.code === 'EPERM') {
      moveDirAcrossDevice(source, dest, clobber, limit, cb);
    } else {
      cb(err);
    }
  });
  outs.on('error', function (err) {
    ins.destroy();
    outs.destroy();
    outs.removeListener('close', onClose);
    cb(err);
  });
  outs.once('close', onClose);
  ins.pipe(outs);
  /**
   * onclose cb
   */
  function onClose() {
    fs.unlink(source, cb);
  }
}

/**
 *
 * @param {string} source
 * @param {string} dest
 * @param {boolean} clobber
 * @param {number} limit
 * @param {Callback} cb
 */
function moveDirAcrossDevice(source: string, dest: string, clobber: boolean, limit: number, cb: Callback) {
  const options = {
    stopOnErr: true,
    clobber: false,
    limit: limit,
  };
  if (clobber) {
    rimraf(dest, { disableGlob: true }, (err) => {
      if (err) return cb(err);
      startNcp();
    });
  } else {
    startNcp();
  }
  /**
   *
   */
  function startNcp() {
    ncp(source, dest, options, (errList) => {
      if (errList) return cb(errList[0]);
      rimraf(source, { disableGlob: true }, cb);
    });
  }
}

export const moveFile = (source: string, dest: string, options = {}) =>
  new Promise((resolve, reject) => {
    mv(source, dest, options, (err: Error | null) => {
      // done. it tried fs.rename first, and then falls back to
      // piping the source file to the dest file and then unlinking
      // the source file.

      if (err) {
        reject(err);
        if (!IS_PROD) console.log(err);
      } else {
        resolve(true);
      }
    });
  });
