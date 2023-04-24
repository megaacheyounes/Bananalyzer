import { ANDROID_MANIFEST, APKTOOL_JAR, APK_TOOL_YML, DECOMPILE_FOLDER } from '../../consts';
import debugModule from 'debug';
import fs from 'fs';
import path from 'path';
import { APK } from '../../models/apk';

const debug = debugModule('bananalyzer:apkreader');
//@ts-ignore
import JavaCallerModule from 'java-caller';

interface DecompileResult {
  isSuccessful: boolean;
  decompileFolderPath?: string;
  manifestPath?: string;
  error?: string;
  apkToolYmlPath?: string;
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

    // 3- decompile with apktool
    const java = new JavaCallerModule.JavaCaller({
      jar: APKTOOL_JAR,
    });

    //todo: only reuse old decompile result when flag is set, and verify if manifest exists
    if (!fs.existsSync(resultPath)) {
      // eslint-disable-next-line no-unused-vars
      const { status, stdout, stderr } = await java.run(['d', '-f', '-o ' + resultPath, apk.filePath]);

      // debug('--- status ----');
      // debug(status);
      // debug('--- stdout ----');
      // debug(stdout);
      //todo: parse and return errors
      debug('--- stderr ----');
      debug(stderr);
    }

    resolve({
      isSuccessful,
      error,
      decompileFolderPath: resultPath,
      manifestPath: path.join(resultPath, ANDROID_MANIFEST),
      apkToolYmlPath: path.join(resultPath, APK_TOOL_YML),
    });
  });
