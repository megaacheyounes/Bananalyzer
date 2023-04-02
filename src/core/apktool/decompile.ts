import { ANDROID_MANIFEST, APKTOOL_JAR, DECOMPILE_FOLDER } from '../../consts';
import debugModule from 'debug';
import fs from 'fs';
import path from 'path';
import { APK } from '../../models/apk';

const debug = debugModule('apkreader');
const JavaCallerModule = require('java-caller');

interface DecompileResult {
  isSuccessful: boolean;
  decompileFolderPath?: string;
  manifestPath?: string;
  error?: string;
}
// java -jar apktool.jar d -o D:\__tasks__\_analyze\dtse_orion\decompile\sample sample.apk
export const decompileApk = async (apk: APK, keepSources: boolean): Promise<DecompileResult> =>
  new Promise(async (resolve, reject) => {
    let isSuccessful = true;
    let error = undefined;

    const apkName = path.basename(apk.filePath);

    debug('apkName', apkName);

    let resultPath = path.join(DECOMPILE_FOLDER, apkName);

    if (!fs.existsSync(DECOMPILE_FOLDER)) fs.mkdirSync(DECOMPILE_FOLDER);

    // 3- analyze using AppCheck
    const java = new JavaCallerModule.JavaCaller({
      jar: APKTOOL_JAR,
    });

    //todo: uncomment
    // eslint-disable-next-line no-unused-vars
    // const { status, stdout, stderr } = await java.run(['d', '-f', '-o ' + resultPath, apk.filePath]);

    // debug('--- status ----');
    // debug(status);
    // debug('--- stdout ----');
    // debug(stdout);
    // debug('--- stderr ----');
    // debug(stderr);

    //todo: detect errors

    resolve({
      isSuccessful,
      error,
      decompileFolderPath: resultPath,
      manifestPath: path.join(resultPath, ANDROID_MANIFEST),
    });
  });
