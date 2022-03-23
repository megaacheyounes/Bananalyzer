"use strict"
var fs = require("fs")
const path = require("path")
const mv = require('./mv')
const debugLib = require('debug')("")
const TEMP_FOLDER = "temp"
const APP_DATA_XSJ = "appdataxsj"
const LOG_FOLDER = ".log"
const ERR_LOG_FILE = "err.log"
const OUT_LOG_FILE = "out.log"
 

const getLogFolder = () => path.join(process.cwd(), LOG_FOLDER,)
const getOutLogFile = () => path.join(getLogFolder(), OUT_LOG_FILE)
const getErrLogFile = () => path.join(getLogFolder(), ERR_LOG_FILE)


/**
 * empty the content of the logs files, called eveytime the script is executed
 */
const clearLogFile = () => {
    if (!fs.existsSync()) {
        fs.mkdirSync(getLogFolder())
    }

    fs.writeFileSync(getOutLogFile(), "")
    fs.writeFileSync(getErrLogFile(), "")
}
/**
 * simple way to simulate a delay using await keyword
 * @param {int} millis delay in milli-seconds
 * 
 */
const delay = (millis) => new Promise((resolve, reject) => { setTimeout(() => resolve(), millis) })

/**
 * use a library to read AndroidManifest.xml file that inside every APK
 * @param {string} apkPath apk path
 * @returns json object that includs all information from manifest file
 *   
 */
const getApkInfo = (apkPath, lookForRootApkIfFailed = true) => new Promise(async (resolve, reject) => {
    //local fork (lol) of adbkit-apkreader with support to read meta data
    const ApkReader = require('./adbkit-apkreader')

    debug('parsing ' + apkPath + " look for root apk= " + lookForRootApkIfFailed)
    if (!fs.existsSync(apkPath)) {
        debug(apkPath + " does not exist")
        throw apkPath + " does not exists!"
    }

    ApkReader.open(apkPath)
        .then(reader => reader.readManifest())
        .then(manifest => resolve(manifest))
        .catch(async (e) => {
            debug(e.message)
            //apk does not contain androidManifest.xml, it has to be an xapk 
            if (e.message.indexOf("does not contain") != -1) {
                const apkpath2 = await getInnerApk(apkPath)
                debug("got inner apk path " + apkpath2)
                if (lookForRootApkIfFailed) {
                    resolve(await getApkInfo(apkpath2, false))
                } else {
                    reject("APK does not contain AndroidManifest.xml")
                }
            }
        })
})

//get the apk inside another apk (xapk, apks)
const getInnerApk = (apkPath) => new Promise(async (resolve, reject) => {
    debug("looking for root APK inside " + apkPath)
    var DecompressZip = require('decompress-zip');
    var unzipper = new DecompressZip(apkPath)

    unzipper.on('error', function (err) {
        debug('getInnerApk:Caught an error');
        console.log(err)
    });

    const fileName = path.basename(apkPath)
    debug("filename: " + fileName)
    unzipper.on('extract', async (files) => {
        files = files.map(f => f.stored)
        if (files.includes(fileName)) {
            //found the damn apk, move it to app data folder 
            const rootApkPath = path.join(TEMP_FOLDER, fileName)
            debug(" root apk  " + rootApkPath)
            const destPath = path.join(APP_DATA_XSJ, fileName)
            debug("moved root apk to " + APP_DATA_XSJ)
            await mv.moveFile(rootApkPath, destPath)
            //delete all extracted files
            fs.rmdirSync(TEMP_FOLDER, { recursive: true });
            resolve(destPath)
        } else {
            //shit!
            reject("What kind of APK is this?")
        }
    });

    unzipper.extract({
        path: 'temp',
        filter: function (file) {
            return file.type !== "SymbolicLink";
        }
    });

})


const currentPlatform = () => {
    const os = require("os")
    const p = os.platform()
    if (p === 'darwin') return 'mac'
    if (p === 'linux') return 'linux'
    if (p === 'win32') return os.arch() === 'x64' ? 'win64' : 'win32'
    return ''
}

const pause = async () => {
    console.log('')
    console.log('Press any key to exit (or slap your face with the keyboard)');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

module.exports = {  
    delay,
    getApkInfo,
    currentPlatform,
    pause
}