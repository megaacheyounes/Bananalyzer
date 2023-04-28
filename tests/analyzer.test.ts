import { AnalyzedApp } from '../src/models/analyzedApp';
import path from 'path';

import { analyzeAPKs } from '../src/core/analyzer';
import { APK } from '../src/models/apk';

import debugModule from 'debug';

debugModule.enable('*');

export const tests = [
  // {
  //   apk: {
  //     packageName: 'com.twitter.android.lite',
  //     filePath: twitterApk,
  //     uploadDate: 'feb 23, 2022',
  //   },
  //   gmsCount: 0,
  //   hmsCount: 0,
  //   googlePermissionsCount: 0,
  // },
  {
    apk: {
      packageName: 'com.megaache.trackingsdks',
      filePath: path.join(__dirname, 'samples', 'sample_2.apk'),
      uploadDate: 'mar 01, 2023',
    },
    version: '2.6.1',
    hmsCount: 7,
    gmsCount: 9,
    versions: ['6.3.0.301', '2.1.0.300'],
  },
];

describe('Analyzer', () => {
  it('should analyze apk', async () => {
    const testApks: APK[] = tests.map((test) => test.apk);
    const analyzedApps = await analyzeAPKs(testApks, true);
    console.log('analyzedApps', analyzedApps);
    expect(analyzedApps).toHaveLength(tests.length);

    for (const i in analyzedApps) {
      const test = tests[i];
      const res = analyzedApps[i];
      expect(res.packageName).toEqual(test.apk.packageName);
      expect(res.storeUploadDate).toEqual(test.apk.uploadDate);
      expect(res.GMS).toHaveLength(test.gmsCount);
      expect(res.HMS).toHaveLength(test.hmsCount);
      expect(res.googleMetadata).toHaveLength(1);
      expect(res.googleActivities).toHaveLength(4);
      expect(res.huaweiPermissions).toHaveLength(1);

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
      // expect(res.googlePermissions.length).toHaveLength(test.googlePermissionsCount);
    }
  }, 360_000); //3 min
});
