export type SdkVersionLocation = {
  filePathWildcard: string;
  fileContainsExact?: string;
  versionRegex?: RegExp;
};

export type SdkSearchLocation = {
  name: string;
  minVersion?: string;
  maxVersion?: string;
  versionSearchLocations: SdkVersionLocation[];
};

export const BUILD_CONFIG_SMALI_VERSION_NAME = new RegExp(
  'field public static final VERSION_NAME:Ljava/lang/String; = "(.*)"'
);

export const GOOGLE_SMALI_ANNOTATION_VERSION = new RegExp('.source "com.google.android.gms:.*@@(.*)"');

export const TRACKING_SDKS: SdkSearchLocation[] = [
  {
    name: 'appsflyer oaid',
    minVersion: '5.4.0',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/appsflyer/oaid/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'kochava tracker',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/kochava/tracker/BuildConfig',
        versionRegex: new RegExp('field public static final SDK_VERSION:Ljava/lang/String; = "(*)"'),
      },
    ],
  },
  {
    name: 'adjust',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/adjust/sdk/BuildConfig',
      },
    ],
  },
];
//todo: add smali
export const GMS_SDKS: SdkSearchLocation[] = [
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
    name: 'cloud messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/cloudmessaging/CloudMessage.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: ' analytics',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/analytics/FirebaseAnalytics',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: ' crashlytics',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/crashlytics/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'dynamic links',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/dynamiclinks/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      {
        filePathWildcard: 'smali*/com/google/firebase/dynamiclinks/DynamicLink',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'in app messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/inappmessaging/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'performance',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/perf/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'remote config',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/remoteconfig/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'play integrity',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/playintegrity/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'safetynet',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/safetynet/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'appcheck',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'app indexing',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appindexing/FirebaseAppIndex',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'ml vision',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/ml/vision/FirebaseVision',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'sms retriever',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/auth/api/phone/SmsRetriever',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'fitness',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/fitness/Fitness',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
];

export const HMS_AG_CLOUD_SERVICES: SdkSearchLocation[] = [
  {
    name: 'auth',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/auth/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'credential',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/credential/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'core',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/core/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'datastore',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/datastore/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'app messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/appmessaging/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'crash service',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/crash/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'location v',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/hms/location/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'Ads Mediation (AppLoving)',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/applovin/mediation/adapters/HuaweiMediationAdapter',
      },
    ],
  },
];

export const OTHER_SDKS: SdkSearchLocation[] = [
  {
    name: 'facebook ads',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/facebook/ads/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'sentry',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/io/sentry/BuildConfig',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
];
