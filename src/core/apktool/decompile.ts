import { execa } from '@esm2cjs/execa';

import { existsSync, mkdirSync } from 'fs';
import { ANDROID_MANIFEST, APKTOOL_JAR, APK_TOOL_YML, DECOMPILE_FOLDER, DECOMPILE_FOLDER_NAME } from '../../consts';
import { APK } from '../../models/apk';
import { basename, join } from 'path';
import debugModule from 'debug';

const debug = debugModule('bananalyzer:apkreader');
//@ts-ignore

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

    if (!existsSync(DECOMPILE_FOLDER)) mkdirSync(DECOMPILE_FOLDER);

    // 3- decompile with apktool
    // const java = new JavaCallerModule.JavaCaller({
    //   jar: APKTOOL_JAR,
    // });

    const manifestPath = join(resultPath, ANDROID_MANIFEST);
    const apkYamlPath = join(resultPath, APK_TOOL_YML);

    //todo: only reuse old decompile result when flag is set, and verify if manifest exists
    if (!existsSync(manifestPath) || !existsSync(apkYamlPath)) {
      const startTime = Date.now();
      // eslint-disable-next-line no-unused-vars
      const args = [
        '-jar',
        APKTOOL_JAR,
        'd',
        //  '-v',
        '--no-assets',
        // '--no-res',
        '--only-main-classes',
        '-f',
        `-o`,
        resultPath,
        apk.filePath,
      ]

      const { stdout, stderr } = await execa('java', args)

      debug('--- stdout ----');
      debug(stdout);
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
  const apkName = basename(apk.filePath);
  const res = join(DECOMPILE_FOLDER_NAME, apkName);
  debug('getDecompileFolderPath', res);
  return res
};
