import { readFileSync } from 'fs';
import path from 'path';

import { getApkInfo } from '../src/core/utils';

//normal apk
const twitterApk = path.join(__dirname, 'samples', 'com.twitter.android.lite.apk');
const twitterManifest = path.join(__dirname, 'samples', 'twitter-lite-manifest.json');

const testApkInfo = async (apk: string, manifestPath: string) => {
  const actualManifest = await getApkInfo(apk);

  const expectedManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  expect(actualManifest).toMatchObject(expectedManifest);
};

describe('Utils', () => {
  it('should return apk info (manifest) for normal APK', async () => {
    testApkInfo(twitterApk, twitterManifest);
  });

  // it('should find inner apk in split apk', async () => {
  //   const destPath = path.join(testTempFolder, path.basename(netflixApk));
  //   if (!existsSync(testTempFolder)) {
  //     mkdirSync(testTempFolder);
  //   }
  //   const innerApkPath = await getInnerApk(netflixApk, destPath);
  //   expect(innerApkPath).toEqual(destPath);

  //   expect(existsSync(innerApkPath)).toEqual(true);

  //   rmSync(testTempFolder, { recursive: true });
  // });

  //todo: handle
  // it('should return apk info (manifest) for split APK', async () => {
  //   testApkInfo(netflixApk, netflixManifest);
  // });

  // it('should throw error for when looking for inner apk for normal apk', async () => {
  //   const destPath = path.join(testTempFolder, path.basename(netflixApk));
  //   await getInnerApk(twitterApk, destPath).catch((e) => expect(e).toBeTruthy);
  // });

  it('should throw error when looking for manifest in non existing apk', async () => {
    const missingApk = path.join(__dirname, 'apks', 'com.non.existing.apk');
    await getApkInfo(missingApk).catch((e) => expect(e).toBeTruthy);
  });
});
