
import { ADS_TACKING_SDKS } from './ADS_SDKS';
import { FIREBASE_SDKS, GOOGLE_SDKS } from './GMS_FIREBASE_SDKS';
import { AppGallery_SERVICES } from './HMS_AG_SDKS';
import { OTHER_SDKS } from './OTHER_SDKS';

export type SdkVersionLocation = {
  filePathWildcard: string;
  fileContainsExact?: string;
  versionRegex?: RegExp;
  ifFileExist?: string;
  accuracy?: 'high' | 'medium' | 'low';
};

export type SdkSearchLocation = {
  name: string;
  minVersion?: string[];
  maxVersion?: string;
  versionSearchLocations: SdkVersionLocation[];
};





export const SDK_DOMAINS = [
  {
    name: 'AppGallery Services',
    sdkSearchLocation: AppGallery_SERVICES,
  },
  {
    name: 'Google Services',
    sdkSearchLocation: GOOGLE_SDKS,
  },
  {
    name: 'Firebase Services',
    sdkSearchLocation: FIREBASE_SDKS,
  },
  {
    name: 'Ads/Tracking',
    sdkSearchLocation: ADS_TACKING_SDKS,
  },
  {
    name: 'Other',
    sdkSearchLocation: OTHER_SDKS,
  },
];


export const getSupportedSdks = () => {

  return SDK_DOMAINS.map(sdkDomain => {
    return ({
      name: sdkDomain.name,
      sdks: sdkDomain.sdkSearchLocation.map(item => {

        return {
          name: item.name,
          accuracy: Array.from(new Set(item.versionSearchLocations.map(l => l.accuracy).filter(acc => !!acc))),
          canGetVersion: item.versionSearchLocations.filter(x => !!x.versionRegex).length > 0,
          //todo:
          canVerifyVersion: false
        }
      })
    })
  })

}