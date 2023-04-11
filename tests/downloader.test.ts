import { downloadAPK, downoadChromiumIfMissing, getDownloadLink } from '../src/core/downloader';
import { ApkSource } from '../src/models/storeInfo';
import { closeBrowser } from '../src/core/downloader';

const packageName = 'com.ubercab.uberlite';
const wrongPackageName = 'com.blahblah.does.not.exist.x234asdfc';

describe('Downloader', () => {
  it('should download chromium if missing', async () => {
    expect(await downoadChromiumIfMissing()).toBeTruthy();
  }, 240_000); //wait 3 minutes, as chromium can be large in size

  it('should get download link from apk.support ', async () => {
    const result = await getDownloadLink(packageName);

    expect(result).toBeTruthy();
    expect(result!.packageName).toEqual(packageName);
    expect(result!.source).toEqual(ApkSource.APK_SUPPORT);
    expect(result!.downloadLink).toBeTruthy();
  }, 60_000);

  it('should throw error for wrong page names apk.support  (source 1)', async () => {
    try {
      var result = await getDownloadLink(wrongPackageName);
      expect(result).toBeFalsy();
    } catch (e) {
      expect(e).toBeTruthy();
    }
  }, 240_000);

  it('should download apk', async () => {
    const result = await downloadAPK(packageName, false);
    console.dir(result);

    expect(result.packageName).toEqual(packageName);
    expect(result.filePath).toBeTruthy();
    closeBrowser();
  }, 60_000);

  it('should use existing apk', async () => {
    const result = await downloadAPK(packageName, true);
    console.dir(result);

    expect(result.packageName).toEqual(packageName);
    expect(result.filePath).toBeTruthy();
    closeBrowser();
  }, 2_000);
});
