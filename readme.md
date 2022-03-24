## Bananalyzer

A simple tool for windows 10, that downloads APKs from Google playstore, analyzes them, and lists all the Google (including firebase) and Huawei SDKs (kits) that are integrated, along with other metadata

## How does it work?

This is a simple nodejs script that has been packaged into an executable (exe) for ease of use. it uses chromium to download APKs from playstore using two sources (websites), then it uses a Java tool called "AppCheck" that looks inside the APK and determines what Google and Huawei SDKs are integrated, then this node tool parses and analyzes the AndroidManifest.xml file to get some metadata, finaly the tool exports the results into an excel file :)

## Instructions

1.  Download latest release (https://github.com/megaacheyounes/bananalyzer/releases/tag/v1.0.0) and extract it
2.  create a txt file and write the package names into it, one package name per line, see `example_apps.txt`
3.  open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
4.  navigate to the folder that contains this tool, exmaple: `cd C://bananalyzer`    
5.  run the command `bananalyzer.exe --keep-apks`   
6.  Bananalyzer will open a file picker, choose the txt file that you created in step 1 and click `Open`   
7.  Bananalyzer will start working, analyzing 3 apks at a time. 
8.  when finished, the results can be found in an excel file, that has the same name as the txt file (example: `example_apps.xlsx`)

## run locally

1. Install NodeJS and Java
2. Clone the repo `git clone https://github.com/megaacheyounes/Bananalyzer.git`
3. Run `npm install`
4. Run `node bananlyzer.js`

## Notes

1.  Do not open the Excel file generated, while Bananalyzer is still running
2.  Bananalyzer will fail to download some apps that are avaialble in certain regions only       
3.  Bananalyzer has unlimited lives, and will commit suicide many times, but it's still being developed and will be made more stable :)  

## Arguments

Bananalyzer accepts 4 arguments: 
1.  `--enable-logs`: print debug logs on the console, as well as into log files that can be found in folder names ".log", if you want to submit an issue please include the log files  (caution: the logs may hurt your eyes)
2.  `--keep-apks`: by default, Bananalyzer will delete the apks that are downloaded to save space. if this flag is specified, Bananalyzer will keep the apks which can be found in a folder named `downloads` (useful if you have a personal data center )      
3.  `--use-existing`: by default Bananalyzer will always download latest apk from playstore. if you happend to analyze an apk, then decide that you have to re-analyze it without re-downloading it, then use this flag. (by using this flag, bananalyzer will **NOT** check if a newer version is available, also analyzing will fail if the apk was partially downloaded)
4.  `--batch-<num>`: to improve efficiancy, this tool handles apks in batches, the default batch size is 3. means it downloads 3 APKs in parallel, analyze them, write the results into the excel sheet, then moves to the next 3 APKs. usage example: `--batch-1`, `--batch-5` (using a large batch size may break Bananalyzer, your PC or the whole universe)

command with all arguments: `bananalyzer.exe --keep-apks --use-existing --batch-6 --enable-logs`

## Analyze an apk outside playstore

If you like to use this tool to analyze an APK that not in the playstore. then follow this steps:

1. create a txt file, and add the package name of the apk (or any package name example: `com.name`)
2. move the apk into `/downloads` folder (create the folder if it does not exist), and rename the apk to the format `(package name).apk`, where package name is the same package name in the txt file that you have created in step1, example `com.name.apk`
3. open a terminal (cmd)
4. navigate to the folder that contains this tool, exmaple: `cd C://bananalyzer`
5. run the command `bananalyzer.exe --use-existing` (you must include the flag `--use-existing`)
6. Bananalyzer will open a file picker, choose the txt file that you created in step 1 and click `Open`
7. Bananalyzer will start working, when finished, the results can be found in an excel file that has the same name as your txt file (example: `example_apps.xlsx`)

## TODO

- [x]   Use a proper logging library for debugging instead of console.log 
- [ ]   Migrate to TypeScript 
- [ ]   Add unit tests
- [ ]   Improve and add missing documentation
- [ ]   Retreive SDKs version from the APK

## License

```
No Copyright (!c) 2022 Younes Megaache
All rights can be abused (respectfully)
```
