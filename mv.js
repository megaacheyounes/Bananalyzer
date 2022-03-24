'use strict';
// stolen from https://github.com/andrewrk/node-mv/edit/master/index.js lol
/**
 * this script helps to move files, i think!
 */
import * as fs from 'fs';
import * as path from 'path';
import { default as ncp } from 'ncp';
import * as rimraf from 'rimraf';
import * as mkdirp from 'mkdirp';

/**
 * move file
 * @param {string} source original path
 * @param {string} dest destination file path
 * @param {object} options options
 * @param {func} cb callback
 *
 */
function mv(source, dest, options, cb) {
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
  function mkdirs() {
    mkdirp(path.dirname(dest), function (err) {
      if (err) return cb(err);
      doRename();
    });
  }

  /**
   * rename file/folder
   */
  function doRename() {
    if (clobber) {
      fs.rename(source, dest, function (err) {
        if (!err) return cb();
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
 * @param {callback} cb
 */
function moveFileAcrossDevice(source, dest, clobber, limit, cb) {
  const outFlags = clobber ? 'w' : 'wx';
  const ins = fs.createReadStream(source);
  const outs = fs.createWriteStream(dest, { flags: outFlags });
  ins.on('error', function (err) {
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
 * @param {callback} cb
 */
function moveDirAcrossDevice(source, dest, clobber, limit, cb) {
  const options = {
    stopOnErr: true,
    clobber: false,
    limit: limit,
  };
  if (clobber) {
    rimraf(dest, { disableGlob: true }, function (err) {
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
    ncp(source, dest, options, function (errList) {
      if (errList) return cb(errList[0]);
      rimraf(source, { disableGlob: true }, cb);
    });
  }
}

export const moveFile = (source, dest, options = {}) =>
  new Promise((resolve, reject) => {
    mv(source, dest, options, function (err) {
      // done. it tried fs.rename first, and then falls back to
      // piping the source file to the dest file and then unlinking
      // the source file.

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
