import {
  BUILD_CONFIG_SMALI_VERSION_NAME,
  gmsFirebasePropVersion,
  GOOGLE_SMALI_ANNOTATION_VERSION,
  PROPERTIES_VERSION,
  SdkSearchLocation,
} from './baseSdks';

export const GMS_FIREBASE_SDKS: SdkSearchLocation[] = [
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
    name: 'messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/messaging/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      {
        filePathWildcard: 'smali*/com/google/android/gms/cloudmessaging/CloudMessage.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('firebase-messaging.properties'),
      {
        filePathWildcard: 'smali*/com/google/firebase/components/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: ' analytics',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/analytics/FirebaseAnalytics.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('firebase-analytics.properties'),
    ],
  },
  {
    name: ' crashlytics',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/crashlytics/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      gmsFirebasePropVersion('firebase-crashlytics.properties'),
    ],
  },
  {
    name: 'dynamic links',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/dynamiclinks/ktx/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      {
        filePathWildcard: 'smali*/com/google/firebase/dynamiclinks/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      {
        filePathWildcard: 'smali*/com/google/firebase/dynamiclinks/DynamicLink.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('firebase-dynamic-links.properties'),
      gmsFirebasePropVersion('firebase-dynamic-links-ktx.properties'),
    ],
  },
  {
    name: 'in app messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/inappmessaging/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'performance',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/perf/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'remote config',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/remoteconfig/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'installations',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/installations/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      gmsFirebasePropVersion('firebase-installations.properties'),
    ],
  },
  {
    name: 'play integrity',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/playintegrity/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'safetynet',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/safetynet/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'appcheck',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'app indexing',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appindexing/FirebaseAppIndex.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'ml vision',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/ml/vision/FirebaseVision.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('play-services-vision.properties'),
    ],
  },
  {
    name: 'sms retriever',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/auth/api/phone/SmsRetriever.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('play-services-auth-api-phone.properties'),
    ],
  },
  {
    name: 'fitness',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/fitness/Fitness.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'cast',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/cast/Cast.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'ml barcode scanner',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/mlkit/vision/barcode/BarcodeScanner.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'vision',
    ifFileExist: 'smali*/com/google/android/gms/vision/CameraSource.smali',
    versionSearchLocations: [gmsFirebasePropVersion('play-services-vision.properties')],
  },
  {
    name: 'tag manager',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/tagmanager/TagManagerService.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'fido',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/fido/Fido.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'fido2',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/fido/fido2/Fido2ApiClient.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'location',
    ifFileExist: 'smali*/com/google/android/gms/location/FusedLocationProviderClient.smali',
    versionSearchLocations: [gmsFirebasePropVersion('play-services-location.properties')],
  },
  {
    name: 'maps',
    ifFileExist: 'smali*/com/google/android/gms/maps/GoogleMap.smali',
    versionSearchLocations: [gmsFirebasePropVersion('play-services-maps.properties')],
  },
];
