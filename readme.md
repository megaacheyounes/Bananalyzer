# Bananalyzer

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/megaacheyounes/bananalyzer)
![GitHub Release Date](https://img.shields.io/github/release-date/megaacheyounes/bananalyzer)
![Platform win64](https://img.shields.io/badge/platform-Win64-red)
![GitHub all releases](https://img.shields.io/github/downloads/megaacheyounes/bananalyzer/total)
![npm](https://img.shields.io/npm/dm/bananalyzer?label=npm%20downloads)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/megaacheyounes/bananalyzer/issues)

<img src="/cover.png" width="640" height="360"/>

A CLI tool for windows 10+, to download, decompile (reverse engineer) and scrape app data from both playstore and AppGallery
 
## Contents

- [Bananalyzer](#bananalyzer)
- [Contents](#contents)
- [How does it work?](#how-does-it-work)
- [Usage](#usage)
- [Demo](#demo)
- [Download](#download)
- [Instructions](#instructions)
  - [Downloading and analyzing a list of apps](#downloading-and-analyzing-a-list-of-apps)
  - [Downloading and analyzing one app](#downloading-and-analyzing-one-app)
  - [Analyzing a list of APKs](#analyzing-a-list-of-apks)
  - [Analyze one apk](#analyze-one-apk)
- [Use in code](#use-in-code)
  - [get apk direct download link](#get-apk-direct-download-link)
  - [download an APK](#download-an-apk)
  - [analyze an APK](#analyze-an-apk)
- [Notes](#notes)
- [Run locally](#run-locally)
- [Build](#build)
- [TODO](#todo)
- [License](#license)

## How does it work?

This is a simple nodejs script that has been packaged into an executable (exe) for ease of use. it uses chromium to download APKs from playstore using two sources (websites), then it uses a Java tool called "AppCheck" that looks inside the APK and determines what Google and Huawei SDKs are integrated, then it parses the AndroidManifest.xml file to get some metadata, finally the tool exports the results into an excel file (scroll down to see a demo)

## Usage

```cli

   USAGE

  $ bananalyzer <command> [option]

   COMMANDS

  package  Download and analyze an app by providing its package name
  apk      Analyze an Apk by providing its file path
  list     Download and analyze a list of apps by providing a file that contains their package names
  apklist  Analyze a list of apps by providing a file that contains their apk file paths
  help     Print help information

   OPTIONS

  -p, --path   Apk full path, required when using command 'apk'
  -n, --name   App package name, required when using Command 'package'
  -d, --debug  Print debug logs Default: false
  -k, --keep   Keep downloaded APKs (can be found in downloads/ folder) Default: false
  -b, --batch  Batch size, optional when using command 'file' Default: 3

```

## Demo

<img src="/screenshot/bananalyzer_demo.gif" width="800" height="474"/>

video: [https://github.com/megaacheyounes/Bananalyzer/blob/master/screenshot/bananalyzer_demo.mp4](https://github.com/megaacheyounes/Bananalyzer/blob/master/screenshot/bananalyzer_demo.mp4)

## Download

latest release (Bananalyzer_v1.1.2_win64.zip):

[https://github.com/megaacheyounes/Bananalyzer/releases/tag/v1.1.2](https://github.com/megaacheyounes/Bananalyzer/releases/tag/v1.1.2)

## Instructions

### Downloading and analyzing a list of apps

1. Download latest release and extract it
2. create a txt file and write the package names into it, one package name per line, see `example_apps.txt`
3. open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
4. navigate to the folder that contains this tool, example: `cd C://bananalyzer`
5. run the command `bananalyzer.exe list -k`
6. Bananalyzer will open a file picker, choose the txt file that you created in **step 1** and click `Open`
7. Bananalyzer will start working, analyzing 3 APKs at a time ( change batch count using `--batch`).
8. when finished, the results can be found in an excel file, that has the same name as the txt file (example: `example_apps.xlsx`)

### Downloading and analyzing one app

1. open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
2. navigate to the folder that contains this tool, example: `cd C://bananalyzer`
3. run the command `bananalyzer.exe package --name 'com.package.name' -k`
4. Bananalyzer will start downloading then analyzing the app
5. when finished, the results can be found in an excel file, that has the same name as the package name (example: `com.package.name.xlsx`)

### Analyzing a list of APKs

1. create a txt file and write the apk path into it, one APK path per line, see `example_apklist.txt`
2. open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
3. navigate to the folder that contains this tool, example: `cd C://bananalyzer`
4. run the command `bananalyzer.exe apklist -k`
5. Bananalyzer will open a file picker, choose the txt file that you created in **step 1** and click `Open`
6. Bananalyzer will start working, analyzing 3 APKs at a time ( change batch count using `--batch` ).
7. when finished, the results can be found in an excel file, that has the same name as the txt file (example: `example_apklist.xlsx`)

### Analyze one apk

1. open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
2. navigate to the folder that contains this tool, example: `cd C://bananalyzer`
3. run the command `bananalyzer.exe apk --path 'C://apks/apk_name.apk'`
4. Bananalyzer will start analyzing the apk
5. when finished, the results can be found in an excel file, that has the same name as the apk file (example: `apk_name.xlsx`)

## Use in code

install

1. `npm install bananalyzer`

_if you get an error related to missing JARs, then copy the folder `lib` to your projects root folder, in other word, folder `lib/` and your `package.json` should be on the same level_

### get apk direct download link

Get direct download link to download APK from PlayStore, Split APKs will be automatically merged into one APK

```typescript
import Bananalyzer from 'bananalyzer';

const result = await Bananalyzer.getDownloadLink('com.aswat.carrefouruae');
console.log(result);
/*
result 
{
  packageName: 'com.aswat.carrefouruae',
  source: 'apk.support',
  downloadLink: 'https://cdn.playstoreapi.com/index.php?ecp=6661ba176d3029632f5798bcfcf5d1dc&action=download&type=mapk', 
  apkSize: '32.61 MB',
  versionName: '18.0.21',
  uploadDate: 'Mar 27, 2023'
}
*/
```

### download an APK

download latest apk from PlayStore, APKs will be saved in `/downloads` folder

```typescript
import Bananalyzer from 'bananalyzer';

const result = await Bananalyzer.downloadAPK('com.ubercab.uberlite');
console.log(result);

/*
result
 {  
      packageName: 'com.ubercab.uberlite',
      filePath: 'D:\\github\\bananalyzer\\downloads\\com.ubercab.uberlite.apk',
      uploadDate: '27 Jan 2023'
    }
*/
```

### get app details

scrape app details from Google play using package name(scrap) (example https://play.google.com/store/apps/details?id=com.facebook.lite)

```typescript
import Bananalyzer from 'bananalyzer';

const details = await Bananalyzer.getPlayStoreDetails('com.facebook.lite');
console.log(details);

/*
details {
  packageName: 'com.facebook.lite',
  name: 'Facebook Lite',
  versionName: 'Varies with device',
  description: "Facebook Lite is fast, works on [...]",
  updatedOn: 'Apr 29, 2023',
  releasedOn: 'Jun 24, 2015',
  requiresAndroid: 'VARY',
  rating: '3.9star',
  downloads: '1B+',
  downloadsDetails: '1,000,000,000+ downloads',
  developer: 'Meta Platforms, Inc.',
  reviewsNumber: '24.3M reviews',
  icon: 'https://play-lh.googleusercontent.com/J--_O-bAdNwLKs8XXsm9dTbt4B19wHXq6qGr5eCAJEagPrdC86aB8RieIkRdqKtSbNM=w240-h480-rw'
}

*/
```

scrape app details from Huawei AppGallery using app Id (ex: https://appgallery.huawei.com/app/C100734965)

```typescript
import Bananalyzer from 'bananalyzer';

const details = await Bananalyzer.getAppGalleryDetails('C100734965');
console.log('details', details);
/*
details {
  packageName: '',
  name: 'BIGO LIVE-Live Stream, Go Live',
  versionName: '5.40.6',
  description: "★★★Over 400 million downloads worldwide[...]',
  updatedOn: '5/18/2023',
  releasedOn: '',
  requiresAndroid: '',
  rating: '4.5',
  downloads: '32M installs',
  downloadsDetails: '',
  reviewsNumber: '57',
  icon: 'https://appimg2.dbankcdn.com/application/icon144/65/1dcc87f9e5994fdfba42a91172de93a7.png',
  screenshots: [
    'https://appimg2.dbankcdn.com/application/screenshut1/65/1dcc87f9e5994fdfba42a91172de93a7.jpg',
    'https://appimg2.dbankcdn.com/application/screenshut2/65/1dcc87f9e5994fdfba42a91172de93a7.jpg',
    [...]
  ]
}
*/
```

### analyze an APK

Analyze an APK, see CLI description above or result below for more details

```typescript
import Bananalyzer from 'bananalyzer';

const result = await Bananalyzer.analyzeAPKs(
  [
    {
      filePath: './sample.apk',
    },
  ],
  true
);
console.log(result);

/*
result
[
    {
        "HMS": [
            "push",
            "location",
            "map",
            "analytics",
            "ads",
            "scan",
            "ml"
        ],
        "GMS": [
            "Account",
            "Push",
            "Location",
            "Map",
            "Analytics",
            "Ads",
            "ML",
            "SafetyNet",
            "Fido"
        ],
        "packageName": "com.megaache.trackingsdks",
        "versionName": "2.6.1",
        "huaweiAppId": "",
        "googleMetadata": [
            "com.google.android.gms.version=@integer/google_play_services_version"
        ],
        "huaweiMetadata": [
            "com.huawei.hms.client.service.name:location=location:SDK-VERSION",
            "com.huawei.hms.min_api_level:location:location=1",
            "com.huawei.hms.client.service.name:push=push:6.1.0.300",
            "com.huawei.hms.min_api_level:push:push=1",
            "com.huawei.hms.client.service.name:ml-computer-vision=ml-computer-vision:2.0.3.300",
            [...]
        ],
        "googlePermissions": [
            "com.google.android.gms.permission.AD_ID",
            "com.google.android.c2dm.permission.RECEIVE",
            "com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE"
        ],
        "huaweiPermissions": [
            "com.huawei.appmarket.service.commondata.permission.GET_COMMON_DATA"
        ],
        "googleActivities": [
            "com.google.android.gms.auth.api.signin.internal.SignInHubActivity",
            "com.google.android.gms.common.api.GoogleApiActivity",
            "com.google.android.gms.ads.AdActivity",
            "com.google.android.gms.ads.OutOfContextTestingActivity"
        ],
        "huaweiActivities": [
            "com.huawei.hms.videokit.player.UpdateActivity",
            "com.huawei.hms.hmsscankit.ScanKitActivity",
            //[...]
        ],
        "googleServices": [
            "com.google.android.gms.auth.api.signin.RevocationBoundService",
            "com.google.firebase.messaging.FirebaseMessagingService",
            "com.google.firebase.components.ComponentDiscoveryService",
            "com.google.android.gms.ads.AdService",
            "com.google.android.datatransport.runtime.backends.TransportBackendDiscovery",
            "com.google.android.datatransport.runtime.scheduling.jobscheduling.JobInfoSchedulerService"
        ],
        "huaweiServices": [
            "com.huawei.location.lite.common.http.HttpService",
            "com.huawei.remoteplayer.RemoteService",
            "com.huawei.agconnect.core.ServiceDiscovery",
            "com.huawei.hms.support.api.push.service.HmsMsgService"
        ],
        "googleMessagingServices": [
            "com.google.firebase.messaging.FirebaseMessagingService"
        ],
        "huaweiMessagingServices": [],
        "hmsVersions": [
            {
                "name": "videokit",
                "version": "1.0.1.300",
                "accuracy": "high"
            },
            [...]
        ],
        "versionCode": "200600100",
        "storeUploadDate": "",
        "apkCreationTime": "27/04/2023, 11:13:20 am",
        "sdkPerDomain": [
            {
                "domain": "HMS",
                "sdks": [
                    {
                        "name": "location",
                        "version": "SDK-VERSION",
                        "accuracy": "high"
                    },
                    [...]
                ]
            },
            {
                "domain": "HMS & AG",
                "sdks": [
                    {
                        "name": "auth",
                        "version": "1.4.2.301",
                        "accuracy": "high"
                    },
                    [...]
                ]
            },
            {
                "domain": "GMS & FIREBASE",
                "sdks": [
                    {
                        "name": "messaging",
                        "version": "23.1.2",
                        "accuracy": "high"
                    },
                    [...]
                ]
            },
            {
                "domain": "ADS & TRACKING",
                "sdks": [
                    {
                        "name": "adjust",
                        "version": "4.33.3",
                        "accuracy": "high"
                    },
                    [...]
                ]
            },
            {
                "domain": "OTHER",
                "sdks": []
            }
        ]
    }
]

  */
```

## Notes

1. Do not open the Excel file generated, while Bananalyzer is still running
2. Bananalyzer will fail to download some apps that are avaialble in certain regions only
3. Bananalyzer has unlimited lives, and will commit suicide many times, but it's still being developed and will be made more stable :)

## Run locally

1. Install NodeJS and Java
2. Clone the repo `git clone https://github.com/megaacheyounes/Bananalyzer.git`
3. Run `npm install`
4. Run `ts-node index.ts`

## Build

1. clone repo
2. its recommended to install global packages: `npm install --global tsc typescript ts-node coyfiles rimraf @vercel/ncc `
3. install modules: `npm install`
4. run cli: `npm run start`
5. build CLI windows executable (.exe): `npm run build` => result in `dist/`
6. build library to publish to npm: `npm run build:npm` => result in `build/`

## TODO

- [x] Use a proper logging library for debugging instead of console.log
- [x] Migrate to TypeScript
- [x] Add unit tests
- [x] Publish npm module
- [x] Update npm packages
- [x] Detect Ads and Tracking SDKs
- [x] Detect Firebase/AppGallery cloud services
- [ ] Improve and add missing documentation
- [x] Scrape app details from Google Playstore
- [x] Scrape app details from Huawie AppGallery 

## License

```text
No Copyright (!c) 2022 Younes Megaache
All rights can be abused (respectfully)
```
