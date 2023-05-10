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
export const decompileApk = async (apk: APK): Promise<DecompileResult> =>
  new Promise(async (resolve, reject) => {
    let isSuccessful = true;
    let error = undefined;

    let resultPath = getDecompileFolderPath(apk);

    if (!fs.existsSync(DECOMPILE_FOLDER)) fs.mkdirSync(DECOMPILE_FOLDER);

    // 3- decompile with apktool
    const java = new JavaCallerModule.JavaCaller({
      jar: APKTOOL_JAR,
    });

    const manifestPath = path.join(resultPath, ANDROID_MANIFEST);
    const apkYamlPath = path.join(resultPath, APK_TOOL_YML);

    //todo: only reuse old decompile result when flag is set, and verify if manifest exists
    if (!fs.existsSync(resultPath) || !fs.existsSync(manifestPath) || !fs.existsSync(apkYamlPath)) {
      const startTime = Date.now();
      // eslint-disable-next-line no-unused-vars
      const { status, stdout, stderr, childJavaProcess } = await java.run([
        'd',
        '-v',
        '--no-assets',
        // '--no-res',
        '--only-main-classes',
        '-f',
        '-o ' + resultPath,
        apk.filePath,
      ], {
        detached: true
      });

      // childJavaProcess.kill('SIGINT');

      debug('--- status ----');
      debug(status);
      debug('--- stdout ----');
      debug(stdout);
      //todo: parse and return errors
      debug('--- stderr ----');
      debug(stderr);
      debug(`decompiling elapsed: ${apk.packageName}  ${(Date.now() - startTime) / 1000} sec`);
    }

    resolve({
      isSuccessful,
      error,
      decompileFolderPath: resultPath,
      manifestPath: manifestPath,
      apkToolYmlPath: apkYamlPath,
    });
  });

export const getDecompileFolderPath = (apk: APK) => {
  const apkName = path.basename(apk.filePath);

  debug('apkName', apkName);
  return path.join(DECOMPILE_FOLDER, apkName);
};
