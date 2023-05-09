import { SdkVersion } from './../../models/analyzedApp';
import { lookupSdkInSmaliSrc } from './sdkAnalyzer/AnalyzeSdks';
import { SdkSearchLocation } from './sdkAnalyzer/baseSdks';
const BUILD_CONFIG_SMALI_VERSION_NAME = new RegExp(
    'field public static final VERSION_NAME:Ljava/lang/String; = "(.+)"'
);

import debugModule from 'debug';

const debug = debugModule('bananalyzer:frameworkDetector');

const NATIVE_ANDROID = "NATIVE"
const REACT_NATIVE = "REACT NATIVE"
const UNITY = "UNITY"
const CORDOVA = "CORDOVA"
const IONIC = "IONIC"
const XAMARIN = "XAMARIN"

export const getFramework = async (decompileFolderPath: string): Promise<SdkVersion> => {
    for (const sdkToSearchFor of FRAMEWORKS) {
        const frameworkRes = await lookupSdkInSmaliSrc(decompileFolderPath, sdkToSearchFor);
        debug('frameworkRes', frameworkRes)
        if (!!frameworkRes) {
            return frameworkRes
        }
    }
    return {
        name: NATIVE_ANDROID,
        accuracy: 'medium',
        version: ''
    }
}

export const FRAMEWORKS: SdkSearchLocation[] = [
    {
        name: CORDOVA,
        versionSearchLocations: [
            {
                filePathWildcard: 'smali*/org/apache/cordova/CordovaWebView.smali',
                accuracy: 'high',
                versionRegex: new RegExp('.field public static final CORDOVA_VERSION:Ljava/lang/String; = "(.+)"')
            }, {
                filePathWildcard: 'smali*/org/apache/cordova/BuildConfig.smali',
                accuracy: 'medium'
            }]
    },
    {
        name: REACT_NATIVE,
        versionSearchLocations: [
            {
                filePathWildcard: 'smali*/com/facebook/react/ReactActivity.smali',
                accuracy: 'high'
            }
        ]
    }, {
        name: UNITY,
        versionSearchLocations: [
            {
                filePathWildcard: 'smali*/com/unity3d/player/BuildConfig.smali',
                versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
                accuracy: 'high'
            },
            {
                filePathWildcard: 'smali*/com/unity3d/player/UnityPlayerActivity.smali',
                accuracy: 'high'
            },
            {
                filePathWildcard: 'smali*/com/unity3d/services/core/webview/WebViewApp.smali',
                accuracy: 'medium'
            },
        ]
    },
];
