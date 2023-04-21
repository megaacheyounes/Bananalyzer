import { APK } from './../src/models/apk';
import { decompileApk } from './../src/core/apktool/decompile';
import path from 'path';
import fs from 'fs';

import { analyzeAPKs } from '../src/core/analyzer';
import { ANDROID_MANIFEST } from '../src/consts';

//normal apk
const sampleApk = path.join(__dirname, 'samples', 'sample.apk');

//todo: support split apk
const uberApk = path.join(__dirname, 'samples', 'com.ubercab.uberlite.apk');

export const testApks: APK[] = [
  {
    packageName: 'com.megaache.trackingsdks',
    filePath: './tests/samples/sample.apk',
    uploadDate: 'feb 24, 2023',
  },
  {
    packageName: 'com.ubercab.uberlite',
    filePath: uberApk,
    uploadDate: 'Mar 30, 2022',
  },
];

describe('Decompiler', () => {
  it('should decompile apk', async () => {
    const result = await decompileApk(testApks[0], false);
    console.dir(result);

    expect(result.isSuccessful).toEqual(true);

    expect(result.manifestPath).toBeTruthy();
    expect(fs.existsSync(result.decompileFolderPath!)).toEqual(true);

    const manifestFile = path.join(result.decompileFolderPath!, ANDROID_MANIFEST);

    const smaliFolder = path.join(result.decompileFolderPath!, 'smali');

    expect(fs.existsSync(manifestFile)).toEqual(true);
    expect(fs.existsSync(smaliFolder)).toEqual(true);
  }, 30_000);
});
