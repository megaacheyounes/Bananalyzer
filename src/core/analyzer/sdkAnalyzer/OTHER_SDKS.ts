import { BUILD_CONFIG_SMALI_VERSION_NAME, SdkSearchLocation } from './baseSdks';

export const OTHER_SDKS: SdkSearchLocation[] = [
  {
    name: 'facebook login',
    versionSearchLocations: [
      {
        filePathWildcard: 'com/facebook/login/BuildConfig',
      },
    ],
  },
  {
    name: 'sentry',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/io/sentry/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
];
