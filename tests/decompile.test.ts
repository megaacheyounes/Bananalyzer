import fs from 'fs';
import path from 'path';
import { decompileApk } from './../src/core/apktool/decompile';

import { ANDROID_MANIFEST } from '../src/consts';

//normal apk
const sampleApk = path.join(__dirname, 'samples', 'sample.apk');

const apk = {
  packageName: 'com.megaache.trackingsdks',
  filePath: './tests/samples/sample.apk',
  uploadDate: 'feb 24, 2023',
};

describe('Decompiler', () => {
  it('should decompile apk', async () => {
    const result = await decompileApk(apk);
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
