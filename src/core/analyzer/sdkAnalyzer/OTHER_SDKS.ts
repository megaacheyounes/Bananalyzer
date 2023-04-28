import { fileURLToPath } from 'url';
import { BUILD_CONFIG_SMALI_VERSION_NAME, SdkSearchLocation } from './baseSdks';

export const OTHER_SDKS: SdkSearchLocation[] = [
  {
    name: 'facebook login',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/facebook/login/BuildConfig.smali',
      },
      {
        filePathWildcard: 'smali*/com/facebook/login/LoginClient.smali',
      },
      {
        filePathWildcard: 'smali*/com/facebook/FacebookActivity.smali',
        accuracy: 'low',
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
  {
    name: 'mastercard',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/mastercard/gateway/android/sdk/Gateway3DSecureActivity.smali',
      },
    ],
  },
  {
    name: 'braze',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/braze/Braze.smali',
      },
    ],
  },
  {
    name: 'clevertap',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/clevertap/android/sdk/AnalyticsManager.smali',
      },
    ],
  },
  {
    name: 'sendbird',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/sendbird/android/SendBird.smali',
      },
    ],
  },
];
