import { AnalyzedApp } from '../src/models/analyzedApp';
import path from 'path';

import { analyzeAPKs } from '../src/core/analyzer';
import { APK } from '../src/models/apk';

import debugModule from 'debug';

debugModule.enable('*');
//normal apk
const sampleApk = path.join(__dirname, 'samples', 'sample.apk');

//normal apk
const twitterApk = path.join(__dirname, 'samples', 'com.twitter.android.lite.apk');

//split apk
const uberApk = path.join(__dirname, 'samples', 'com.ubercab.uberlite.apk');

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
  // {
  //   apk: {
  //     packageName: 'com.megaache.trackingsdks',
  //     filePath: sampleApk,
  //     uploadDate: 'mar 01, 2023',
  //   },
  //   gmsCount: 0,
  //   hmsCount: 3,
  // },
  {
    apk: {
      packageName: 'com.aswat.carrefouruae',
      filePath: path.join(__dirname, 'samples', 'com.aswat.carrefouruae.apk'),
      uploadDate: 'April 01, 2023',
    },
    gmsCount: 6,
    hmsCount: 0,
  },

  // {
  //   apk: {
  //     packageName: 'com.ubercab.uberlite',
  //     filePath: uberApk,
  //     uploadDate: 'Mar 30, 2022',
  //   },
  //   gmsCount: 0,
  //   hmsCount: 0,
  //   googlePermissionsCount: 1,
  // },
];

describe('Analyzer', () => {
  it('should analyze apk', async () => {
    const testApks: APK[] = tests.map((test) => test.apk);
    const analyzedApps = await analyzeAPKs(testApks, true);

    expect(analyzedApps).toHaveLength(tests.length);

    for (const i in analyzedApps) {
      const test = tests[i];
      const res = analyzedApps[i];
      expect(res.packageName).toEqual(test.apk.packageName);
      expect(res.storeUploadDate).toEqual(test.apk.uploadDate);
      expect(res.GMS.length).toHaveLength(test.gmsCount);
      expect(res.HMS.length).toHaveLength(test.hmsCount);
      expect(res.googleMetadata.length).toBeGreaterThan(1);
      // expect(res.googlePermissions.length).toHaveLength(test.googlePermissionsCount);
    }
  }, 240_000); //3 min
});
