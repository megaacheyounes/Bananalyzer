import { downloadAPK, getDownloadLink } from '../src/core/downloader';

const packageName = 'com.facebook.lite';
const wrongPackageName = 'com.blahblah.does.not.exist.x234asdfc';

describe('Downloader', () => {
  it('should get download link  ', async () => {
    const result = await getDownloadLink(packageName, true, true);

    expect(result).toBeTruthy();
    expect(result!.packageName).toEqual(packageName);
    expect(result!.downloadLink).toBeTruthy();
  }, 60_000);

  it('should throw error for wrong package name', async () => {
    try {
      var result = await getDownloadLink(wrongPackageName, true, true);
      expect(result).toBeFalsy();
    } catch (e) {
      expect(e).toBeTruthy();
    }
  }, 60_000);

  it('should download apk', async () => {
    const result = await downloadAPK(packageName, false, false, true);
    console.dir(result);

    expect(result.packageName).toEqual(packageName);
    expect(result.filePath).toBeTruthy();
  }, 60_000);

  it('should use existing apk', async () => {
    const result = await downloadAPK(packageName, true, true, true);
    console.dir(result);

    expect(result.packageName).toEqual(packageName);
    expect(result.filePath).toBeTruthy();
  }, 2_000);
});
