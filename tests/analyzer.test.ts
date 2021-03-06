import path from 'path';

import { analyzeAPKs } from '../src/core/analyzer';
import { APK } from '../src/models/apk';

//normal apk
const twitterApk = path.join(__dirname, 'apks', 'com.twitter.android.lite.apk');

//split apk
const uberApk = path.join(__dirname, 'apks', 'com.ubercab.uberlite.apk');

describe('Analyzer', () => {
  it('should analyze apk', async () => {
    const apks: APK[] = [
      {
        packageName: 'com.twitter.android.lite',
        filePath: twitterApk,
        uploadDate: 'feb 23, 2022',
      },
      {
        packageName: 'com.ubercab.uberlite',
        filePath: uberApk,
        uploadDate: 'Mar 30, 2022',
      },
    ];

    const result = await analyzeAPKs(apks, true);
    console.dir(result);

    expect(result).toHaveLength(2);

    // expect(result[0]).toco;
    const expectedKeys = [
      'packageName',
      'versionName',
      'uploadDate',
      'apkCreationTime',
      'huaweiAppId',
      'GMS',
      'HMS',
      'googleMetadatas',
      'huaweiMetadatas',
      'googlePermissions',
      'huaweiPermissions',
      'googleActivities',
      'huaweiActivities',
      'googleServices',
      'huaweiServices',
      'googleMessagingServices',
      'huaweiMessagingServices',
    ];

    expect(Object.keys(result[0])).toEqual(expectedKeys);
    expect(Object.keys(result[1])).toEqual(expectedKeys);

    for (var i of Array(2).keys()) expect(result[i].uploadDate).toEqual(apks[i].uploadDate);

    expect(result[0].GMS).toHaveLength(0);
    expect(result[0].googlePermissions).toHaveLength(0);
    expect(result[0].huaweiPermissions).toHaveLength(0);

    expect(result[1].GMS).toHaveLength(6);

    expect(result[1].googlePermissions).toHaveLength(2);
    expect(result[1].googlePermissions).toContain('com.google.android.c2dm.permission.RECEIVE');
  });
});
