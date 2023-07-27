import { getAppDetails } from '../src/core/scraper/googlePlayScrapper';
import { isValidDate } from '../src/utils/dateTimeUtils';

export const testApps = [
  {
    packageName: 'com.facebook.lite',
    name: 'Facebook Lite',
    releasedOn: 'Feb 7, 2017',
    developer: 'Meta Platforms, Inc.',
    requiresAndroid: 'VARY',
  },
  {
    packageName: 'com.microsoft.office.word',
    name: 'Microsoft Word: Edit Documents',
    releasedOn: '29 Sept 2015',
    developer: 'Microsoft Corporation',
    requiresAndroid: '9 and up',
  },
  {
    packageName: 'com.king.candycrushsaga',
    name: 'Candy Crush Saga',
    releasedOn: 'Nov 15, 2012',
    developer: 'King',
    requiresAndroid: '5.0 and up',
  },
];
describe('appDetailsScrapper', () => {
  for (const testApp of testApps) {
    it(`should get ${testApp.name} app information`, async () => {
      const details = await getAppDetails(testApp.packageName);
      expect(details?.name).toEqual(testApp.name);
      expect(details?.packageName).toEqual(testApp.packageName);
      expect(details?.developer).toEqual(testApp.developer);
      expect(details?.requiresAndroid).toEqual(testApp.requiresAndroid);

      expect(isValidDate(details?.updatedOn as string)).toEqual(true);
      expect(isValidDate(details?.releasedOn as string)).toEqual(true);

      expect(new Date(details?.releasedOn as string)).toEqual(new Date(testApp.releasedOn));
    }, 62_000);
  }

  it(`should throw error when packageName is invalid`, async () => {
    try {
      const details = await getAppDetails('com.invalid.package.name');

      expect(details).toBeUndefined();
    } catch (e) {
      expect(e).toBeTruthy();
    }
  }, 62_000);
});
