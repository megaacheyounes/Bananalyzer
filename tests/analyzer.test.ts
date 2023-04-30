import path from 'path';

import { analyzeAPKs } from '../src/core/analyzer';
import { APK } from '../src/models/apk';

import debugModule from 'debug';
import { existsSync } from 'fs';
import { getDecompileFolderPath } from '../src/core/apktool/decompile';

debugModule.enable('*');

const test = {
  apk: {
    packageName: 'com.megaache.trackingsdks',
    filePath: path.join(__dirname, 'samples', 'sample_2.apk'),
    uploadDate: 'mar 01, 2023',
  },
  version: '2.6.1',
  hmsCount: 7,
  gmsCount: 9,
  versions: ['6.3.0.301', '2.1.0.300'],
  keepDecompileFolder: false,
};
//  const test=  {
//   apk: {
//     packageName: 'com.ubercab.uberlite',
//     filePath: path.join(__dirname, 'samples', 'com.ubercab.uberlite.apk'),
//     uploadDate: 'feb 23, 2022',
//   },
//   gmsCount: 6,
//   hmsCount: 0,
//   googlePermissionsCount: 2,
//   versions: ['17.0.0', '20.2.4'],
//   keepDecompileFolder: true,
// },

describe('Analyzer', () => {
  it('should analyze apk 1', async () => {
    const ress = await analyzeAPKs([test.apk], test.keepDecompileFolder);
    console.log('res', ress);

    // expect(existsSync(getDecompileFolderPath(test.apk))).toEqual(test.keepDecompileFolder);

    const res = ress[0];
    expect(res.packageName).toEqual(test.apk.packageName);
    expect(res.storeUploadDate).toEqual(test.apk.uploadDate);
    expect(res.GMS).toHaveLength(test.gmsCount);
    expect(res.HMS).toHaveLength(test.hmsCount);

    if (!!res.sdkPerDomain)
      expect(res.sdkPerDomain!).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sdks: expect.arrayContaining([
              expect.objectContaining({
                version: test.versions[0],
              }),
            ]),
          }),
        ])
      );
  }, 180_000); //3 min
});
