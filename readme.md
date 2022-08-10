![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/megaacheyounes/bananalyzer)
![GitHub Release Date](https://img.shields.io/github/release-date/megaacheyounes/bananalyzer)
![Platform win64](https://img.shields.io/badge/platform-Win64-red)
![GitHub all releases](https://img.shields.io/github/downloads/megaacheyounes/bananalyzer/total)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/megaacheyounes/bananalyzer/issues)


## Bananalyzer

A simple tool for windows 10, that downloads APKs from Google playstore, analyzes them, and lists all the Google and Huawei SDKs (kits) that are integrated, along with other metadata

## Contents
- [How does it work?](#how-does-it-work)
- [Usage](#usage)
- [Demo](#demo)
- [Download](#download)
- [Instructions](#instructions)
- [Notes](#notes)


## How does it work?

This is a simple nodejs script that has been packaged into an executable (exe) for ease of use. it uses chromium to download APKs from playstore using two sources (websites), then it uses a Java tool called "AppCheck" that looks inside the APK and determines what Google and Huawei SDKs are integrated, then it parses the AndroidManifest.xml file to get some metadata, finaly the tool exports the results into an excel file (scroll down to see a demo)

## Usage
```
  $ bananalyzer <command> [option]

   COMMANDS 

  file     Download and analyze a list of apps by providing a file that contains their package names
  package  Download and analyze an app by providing its package name
  apk      Analyze an Apk by providing its file path
  help     Print help information

   OPTIONS 

  -p, --path   Apk full path, required when using command 'apk'
  -n, --name   App package name, required when using Command 'package'
  -d, --debug  Print debug logs, Default: false
  -k, --keep   Keep downloaded APKs (can be found in downloads/ folder), Default: false
  -r, --reuse  Re-use existing APKs that are found in download folder, Default: false
  -b, --batch  Batch size, optional when using command 'file', Default: 3
```

## Demo 
<img src="/screenshot/bananalyzer_demo.gif" width="800" height="474"/>

video: https://github.com/megaacheyounes/Bananalyzer/blob/master/screenshot/bananalyzer_demo.mp4

## download 
latest release: https://github.com/megaacheyounes/Bananalyzer/releases/tag/v1.0.2

## Instructions

##### Downloading and analyzing a list of apps

1.  Download latest release and extract it
2.  create a txt file and write the package names into it, one package name per line, see `example_apps.txt`
3.  open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
4.  navigate to the folder that contains this tool, exmaple: `cd C://bananalyzer`    
5.  run the command `bananalyzer.exe file -k -r`   
6.  Bananalyzer will open a file picker, choose the txt file that you created in step 1 and click `Open`   
7.  Bananalyzer will start working, analyzing 3 apks at a time ( change batch count using --batch or -b). 
8.  when finished, the results can be found in an excel file, that has the same name as the txt file (example: `example_apps.xlsx`)

##### Downloading and analyzing one app

1.  open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
2.  navigate to the folder that contains this tool, exmaple: `cd C://bananalyzer`    
3.  run the command `bananalyzer.exe package --name 'com.package.name' -k -r`     
4.  Bananalyzer will start downloading then analyzing the app 
5.  when finished, the results can be found in an excel file, that has the same name as the package name (example: `com.package.name.xlsx`)

##### Analyze an apk

1.  open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
2.  navigate to the folder that contains this tool, exmaple: `cd C://bananalyzer`    
3.  run the command `bananalyzer.exe apk --path 'C://apks/apk_name.apk'`     
4.  Bananalyzer will start analyzing the apk 
5.  when finished, the results can be found in an excel file, that has the same name as the apk file (example: `apk_name.xlsx`)

## Run locally

1. Install NodeJS and Java
2. Clone the repo `git clone https://github.com/megaacheyounes/Bananalyzer.git`
3. Run `npm install`
4. Run `ts-node index.ts`

## Notes

1.  Do not open the Excel file generated, while Bananalyzer is still running
2.  Bananalyzer will fail to download some apps that are avaialble in certain regions only       
3.  Bananalyzer has unlimited lives, and will commit suicide many times, but it's still being developed and will be made more stable :)  


## TODO

- [x]   Use a proper logging library for debugging instead of console.log 
- [x]   Migrate to TypeScript 
- [x]   Add unit tests
- [ ]   Improve and add missing documentation


## License

```
No Copyright (!c) 2022 Younes Megaache
All rights can be abused (respectfully)
```
