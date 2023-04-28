import fs from 'fs';
import path from 'path';
import readline, { Interface } from 'readline';
import { SdkVersion } from '../../../models/analyzedApp';
import { SdkSearchLocation, SdkVersionLocation } from './baseSdks';

import glob from 'glob';

import debugModule from 'debug';
import { SdkPerDomain } from '../../../models/analyzedApp';
import { HMS_AG_CLOUD_SERVICES } from './HMS_AG_SDKS';
import { GMS_FIREBASE_SDKS } from './GMS_FIREBASE_SDKS';
import { ADS_TACKING_SDKS } from './ADS_SDKS';
import { OTHER_SDKS } from './OTHER_SDKS';
const debug = debugModule('bananalyzer:analyzeTrackingSdks');

export interface DetectedSdk {
  name: string;
  version: string;
  meetsRequirements: boolean;
}
const VERSION_LOOKUP_FAILED = '-1';
const VERSION_SKIPPED = '0';

const SDK_DOMAINS = [
  {
    name: 'HMS & AG',
    sdkSearchLocation: HMS_AG_CLOUD_SERVICES,
  },
  {
    name: 'GMS & FIREBASE',
    sdkSearchLocation: GMS_FIREBASE_SDKS,
  },
  {
    name: 'ADS & TRACKING',
    sdkSearchLocation: ADS_TACKING_SDKS,
  },
  {
    name: 'OTHER',
    sdkSearchLocation: OTHER_SDKS,
  },
];

export const analyzeSdks = async (decompileFolderPath: string): Promise<SdkPerDomain[]> => {
  const res: SdkPerDomain[] = [];
  //todo: add safety tests

  if (!fs.existsSync(decompileFolderPath)) {
    return [];
  }

  for (const domain of SDK_DOMAINS) {
    const domainRes: SdkVersion[] = [];
    for (const sdkToSearchFor of domain.sdkSearchLocation) {
      const sdkVersion = await lookupSdkInSmaliSrc(decompileFolderPath, sdkToSearchFor);
      if (!!sdkVersion) {
        domainRes.push(sdkVersion!);
        // debug('found SDK ', sdkToSearchFor.name, ':', sdkVersion);
      }

      //todo: check if meets requirement
    }
    res.push({
      domain: domain.name,
      sdks: domainRes,
    });
  }
  return res;
};

const lookupSdkInSmaliSrc = async (
  folderPath: string,
  sdkToSearchFor: SdkSearchLocation
): Promise<SdkVersion | undefined> =>
  new Promise(async (resolve, reject) => {
    if (!!sdkToSearchFor.ifFileExist) {
      //check if file exist first
      const files = await getMatchingFilesGlob(sdkToSearchFor.ifFileExist, folderPath);
      if (!files || files.length == 0) {
        return resolve(undefined);
      }
    }

    if (!sdkToSearchFor.versionSearchLocations || sdkToSearchFor.versionSearchLocations.length == 0) {
      console.warn('!!! No search locations declared for', sdkToSearchFor.name);
      return resolve(undefined);
    }

    const name = sdkToSearchFor.name;

    for (const index in sdkToSearchFor.versionSearchLocations) {
      const versionLocation = sdkToSearchFor.versionSearchLocations[index];
      // debug('checking #', index, '=>', versionLocation.filePathWildcard);

      //find files to search inside for version number
      const matches = await getMatchingFilesGlob(versionLocation.filePathWildcard, folderPath);
      // debug('matches: ', versionLocation.filePathWildcard, '=>', matches);

      if (!matches || matches.length == 0) {
        //sdk does not exist in apk
        return resolve(undefined);
      }

      if (!versionLocation.versionRegex) {
        //we don't need to look for version
        return resolve({
          name,
          accuracy: 'medium',
          version: VERSION_SKIPPED,
        });
      }

      //files that match the search wildcard
      for (let matchPath of matches) {
        const version = await getVersionFromFileIfMatches(path.join(folderPath, matchPath), versionLocation);

        if (!!version) {
          //we found version, stop looking in other places
          return resolve({ name, version, accuracy: 'high' });
        }
      }
    }

    resolve({
      name,
      version: VERSION_LOOKUP_FAILED,
      accuracy: 'medium',
    });
  });

const getMatchingFilesGlob = async (filePathWildcard: string, directory: string): Promise<string[] | undefined> =>
  new Promise((resolve, reject) => {
    glob(
      filePathWildcard,
      {
        cwd: directory,
      },
      async (err: Error | null, matches: string[]) => {
        if (err) {
          console.warn(err);
          return resolve(undefined);
        }
        resolve(matches);
      }
    );
  });

const getVersionFromFileIfMatches = async (
  filePath: string,
  sdkVersionLocation: SdkVersionLocation
): Promise<string | undefined> => {
  debug('=== search for version in: ', filePath);

  //check if file content contains all strings in sdkVersionLocation.fileContainsExact
  const stringToSearch = sdkVersionLocation.fileContainsExact;
  if (!!stringToSearch && stringToSearch.length > 0) {
    //string was not found, the file is not what we're looking for
    if (!stringExistInFile(filePath, stringToSearch)) {
      // debug('the string ' + stringToSearch + ' was not found in ' + filePath, ' >>> aborting !!!');
      return undefined;
    }
  }

  //at this point all required strings where found in the file
  //aka, we found the file we're looking for
  // debug('now searching for version name', filePath, 'exist=>', fs.existsSync(filePath));

  //search for sdk version  number
  //todo: optimize: search in whole file at once, not line by line
  for await (const line of fileLinesStream(filePath)) {
    const matchResult = line.match(sdkVersionLocation.versionRegex!);

    if (!!matchResult) {
      // debug('match result', matchResult);
      return matchResult[1];
    }
  }
  //version could not be found
  // debug('file found but version was not found, file=>', filePath, ' regex => ', sdkVersionLocation.versionRegex);
  return undefined;
};

const stringExistInFile = async (filePath: string, stringToSearch: string): Promise<boolean> => {
  for await (const line of fileLinesStream(filePath)) {
    if (line.includes(stringToSearch)) {
      debug('found string', stringToSearch);
      return true;
    }
  }
  return false;
};

const fileLinesStream = (filePath: string): Interface => {
  let fileStream = fs.createReadStream(filePath);
  const fileLineConfig = {
    input: fileStream,
    crlfDelay: Infinity,
  };
  return readline.createInterface(fileLineConfig);
};
