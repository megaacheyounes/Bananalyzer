import { BUILD_CONFIG_SMALI_VERSION_NAME, GOOGLE_SMALI_ANNOTATION_VERSION, SdkSearchLocation } from './baseSdks';

//ads and tacking sdks
export const ADS_TACKING_SDKS: SdkSearchLocation[] = [
  {
    name: 'admob',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/ads/AdActivity.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'ads mediation (applovin)',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/applovin/mediation/adapters/HuaweiMediationAdapter.smali',
      },
    ],
  },
  {
    name: 'ads mediation (admob)',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/hmscl/huawei/admob_mediation/BuildConfig.smali',
      },
    ],
  },
  {
    name: 'ads mediation (mopub)',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/hmscl/huawei/ads/mediation_adapter_mopub/BuildConfig.smali',
      },
    ],
  },
  {
    name: 'facebook ads',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/facebook/ads/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'mopub ads',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/mopub/mobileads/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'appsflyer oaid',
    minVersion: ['5.4.0'],
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/appsflyer/oaid/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'appsflyer',
    minVersion: ['5.4.0 (oaid)', '6.2.3 (referrer)'],
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/appsflyer/AFLogger.smali',
        versionRegex: new RegExp('const-string v., "AppsFlyer_(.+)"'),
      },
      {
        filePathWildcard: 'smali*/com/appsflyer/AFVersionDeclaration.smali',
        versionRegex: new RegExp('const-string v., "!SDK-VERSION-STRING!:com.appsflyer:af-android-sdk:(.+)"'),
      },
    ],
  },
  {
    name: 'kochava tracker',
    minVersion: ['3.8.0'],
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/kochava/tracker/BuildConfig.smali',
        versionRegex: new RegExp('field public static final SDK_VERSION:Ljava/lang/String; = "(.+)"'),
      },
    ],
  },
  {
    name: 'adjust',
    minVersion: ['4.2.2 (oaid)', '4.28.6 (referrer)'],
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/adjust/sdk/Constants.smali',
        versionRegex: new RegExp('.field public static final CLIENT_SDK:Ljava/lang/String; = "android(.+)"'),
      },
      {
        filePathWildcard: 'smali*/com/adjust/sdk/DeviceInfo.smali',
        versionRegex: new RegExp('const-string v., "android(.+)"'),
      },
    ],
  },
];
