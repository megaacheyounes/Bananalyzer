import {
  downloadAPK,
  downoadChromiumIfMissing,
  getDownloadLink1,
  getChromiumPage,
  getDownloadLink2,
} from '../src/downloader';
import { ApkSource } from '../src/models/storeInfo';
import { closeBrowser } from '../src/downloader';

const packageName = 'com.ubercab.uberlite';
const wrongPackageName = 'com.blahblah.does.not.exist.x234asdfc';
describe('Downloader', () => {
  it('should download chromium if missing', async () => {
    expect(await downoadChromiumIfMissing()).toBeTruthy();
  }, 240_000); //wait 3 minutes, as chromium can be large in size

  it('should get download link from apk.support (source 1)', async () => {
    const page = await getChromiumPage();

    const result = await getDownloadLink1(page, packageName);

    expect(result.packageName).toEqual(packageName);
    expect(result.source).toEqual(ApkSource.APK_SUPPORT);
    expect(result.downloadLink).toBeTruthy();
  });

  it('should throw error for wrong page names apk.support  (source 1)', async () => {
    const page = await getChromiumPage();

    var result = await getDownloadLink1(page, wrongPackageName).catch((e) => expect(e).toBeTruthy());

    expect(result).toBeFalsy();
  });

  it('should get download link from apps.evozi (source 2)', async () => {
    const page = await getChromiumPage(true);

    const result = await getDownloadLink2(page, packageName);

    expect(result.packageName).toEqual(packageName);
    expect(result.source).toEqual(ApkSource.APPS_EVOZI);
    expect(result.downloadLink).toBeTruthy();
    page.close();
    closeBrowser();
  }, 30_000);

  it('should throw error for wrong page names  apps.evozi (source 2)', async () => {
    const page = await getChromiumPage(true);

    var result = await getDownloadLink2(page, wrongPackageName).catch((e) => expect(e).toBeTruthy());

    expect(result).toBeFalsy();
    page.close();
    closeBrowser();
  }, 30_000);
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
