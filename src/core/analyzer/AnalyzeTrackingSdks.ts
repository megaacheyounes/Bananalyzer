import fs from 'fs';
import path from 'path';
import readline, { Interface } from 'readline';
import { SdkVersionLocation, TrackingSDK, TRACKING_SDKS } from './../apktool/sdks';

import glob from 'glob';

import debugModule from 'debug';
const debug = debugModule('bananalyzer:analyzeTrackingSdks');

export interface TrackingSdkResult {
  name: string;
  version: string;
  meetsRequirements: boolean;
}
export interface TrackingSdksResult {
  sdksNumber: number;
  sdks: TrackingSdkResult[];
}

export const analyzeTrackingSdks = (decompileFolderPath: string): Promise<TrackingSdksResult> =>
  new Promise(async (resolve, reject) => {
    const sdks: TrackingSdkResult[] = [];
    debug('path ', decompileFolderPath);

    for (const sdkToSearchFor of TRACKING_SDKS) {
      //todo: loop through all sdks
      const version = await findTrackingSdkVersion(decompileFolderPath, sdkToSearchFor);

      debug('found SDK ', sdkToSearchFor.name, ':', version);
      //todo: check if meets requirement
    }

    resolve({
      sdksNumber: sdks.length,
      sdks,
    });
  });

const findTrackingSdkVersion = async (folderPath: string, trackingSdk: TrackingSDK): Promise<String | undefined> =>
  new Promise(async (resolve, reject) => {
    for (const index in trackingSdk.versionSearchLocations) {
      const versionLocation = trackingSdk.versionSearchLocations[index];
      debug('checking #', index, '=>', versionLocation.filePathWildcard);

      //find files to search inside for version number
      glob(
        // 'smali/**/appsflyer/**.smali',
        versionLocation.filePathWildcard,
        {
          cwd: folderPath,
        },
        async (err: Error | null, matches: string[]) => {
          debug('matches: ', index, '=>', matches);

          let version = undefined;
          for (let matchPath of matches.slice(0, 2)) {
            version = await getVersionFromFileIfMatches(path.join(folderPath, matchPath), versionLocation);

            if (!!version) {
              break;
            }
          }
          resolve(version);
        } //glob
      );
    }
  });

const getVersionFromFileIfMatches = async (
  filePath: string,
  sdkVersionLocation: SdkVersionLocation
): Promise<string | undefined> => {
  debug('=== search for version in: ', filePath);

  //check if file content contains all strings in sdkVersionLocation.fileContainsExact
  const stringToSearch = sdkVersionLocation.fileContainsExact;
  let stringFound = false;
  //todo: optimize, stop searching when finding the first occurrence
  for await (const line of fileLinesStream(filePath)) {
    if (line.includes(stringToSearch)) {
      stringFound = true;
      debug('found string', stringToSearch);
    }
  }

  //string was not found, the file is not what we're looking for
  if (!stringFound) return undefined;

  //at this point all required strings where found in the file
  //aka, we found the file we're looking for
  debug('now searching for version ');
  //search for sdk version  number
  for await (const line of fileLinesStream(filePath)) {
    //todo: optimize, stop processing after finding version
    const matchResult = line.match(sdkVersionLocation.versionRegex);
    debug('match result', matchResult);
    if (!!matchResult) {
      return matchResult[1];
    }
  }
  //version could not be found
  debug('!!! file found but version was not found, file=>', filePath, ' regex => ');
  return undefined;
};

const fileLinesStream = (filePath: string): Interface => {
  let fileStream = fs.createReadStream(filePath);
  const fileLineConfig = {
    input: fileStream,
    crlfDelay: Infinity,
  };
  return readline.createInterface(fileLineConfig);
};
