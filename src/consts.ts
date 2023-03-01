import path from 'path';

export const IS_PROD = process.env.NODE_ENV != 'debug';

export const SRC_DIR = __dirname;

export var EXPORT_DIR = process.cwd();

//files
export const ANDROID_MANIFEST = 'AndroidManifest.xml';

//app check
export const APP_DATA_XSJ = 'appdataxsj';
export const APP_CHECK_JAR = 'lib/AppCheck.jar';
export const APP_DATA_FOLDER = path.join(EXPORT_DIR, APP_DATA_XSJ);
export const GMS_OUTPUT = path.join(APP_DATA_FOLDER, 'output_gms.txt');
export const HMS_OUTPUT = path.join(APP_DATA_FOLDER, 'output_hms.txt');

//apktool
export const APKTOOL_JAR = 'lib/apktool.jar';
export const DECOMPILE_FOLDER = path.join(EXPORT_DIR, 'decompile');

//chrome
export const CHROMIUM_REVISION = 970485;

export const CHROMIUM_EXEC_PATH = path.join(
  EXPORT_DIR,
  '.local-chromium',
  `chromium-win64-${CHROMIUM_REVISION}`,
  'chrome-win',
  'chrome.exe'
);
export const CHROMIUM_INSTALL_PATH = path.join(EXPORT_DIR, '.local-chromium');

//downloads
// folder where the APKs will be stored
export const DOWNLOAD_FOLDER = path.join(EXPORT_DIR, 'downloads');

//logs
export const TEMP_FOLDER = path.join(EXPORT_DIR, 'temp');
export const LOG_FOLDER = path.join(EXPORT_DIR, '.log');
const ERR_LOG_FILENAME = 'err.log';
const OUT_LOG_FILENAME = 'out.log';
export const OUT_LOG_FILE = path.join(LOG_FOLDER, OUT_LOG_FILENAME);
export const ERR_LOG_FILE = path.join(LOG_FOLDER, ERR_LOG_FILENAME);

export const MAX_PACKAGE_NAMES = 200;

//args defaults
export const DEFAULT_BATCH_SIZE = 3;

export const UNKNOWN_INFO = '';

export const GOOGLE_MESSAGING_EVENT = 'com.google.firebase.MESSAGING_EVENT';
export const HUAWEI_MESSAGING_EVENT = 'com.huawei.push.action.MESSAGING_EVENT';
