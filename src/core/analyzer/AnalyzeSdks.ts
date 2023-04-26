import fs from 'fs';
import path from 'path';
import readline, { Interface } from 'readline';
import { AG_CLOUD_SERVICES, GMS_SDKS, SdkVersionLocation, TRACKING_SDKS } from '../apktool/sdks';
import { SdkSearchLocation } from './../apktool/sdks';

import glob from 'glob';

import debugModule from 'debug';
import { SdkPerDomain, SdkVersion } from '../../models/analyzedApp';
const debug = debugModule('bananalyzer:analyzeTrackingSdks');

export interface DetectedSdk {
  name: string;
  version: string;
  meetsRequirements: boolean;
}

export const analyzeSdks = async (decompileFolderPath: string): Promise<SdkPerDomain[]> => {
  const res: SdkPerDomain[] = [];
  //todo: add safety tests

  if (!fs.existsSync(decompileFolderPath)) {
    return [];
  }

  const domains = [
    {
      name: 'AG Cloud Services',
      sdkSearchLocation: AG_CLOUD_SERVICES,
    },
    {
      name: 'GMS SDKs',
      sdkSearchLocation: GMS_SDKS,
    },
    {
      name: 'Tracking SDKs',
      sdkSearchLocation: TRACKING_SDKS,
    },
  ];

  for (const domain of domains) {
    const domainRes: SdkVersion[] = [];
    for (const sdkToSearchFor of domain.sdkSearchLocation) {
      const sdkVersion = await lookupSdkInSmaliSrc(decompileFolderPath, sdkToSearchFor);
      domainRes.push({
        name: sdkToSearchFor.name,
        version: sdkVersion || '-1',
        accuracy: 'high',
      });

      debug('found SDK ', sdkToSearchFor.name, ':', sdkVersion);

      //todo: check if meets requirement
    }
    res.push({
      domain: domain.name,
      sdks: domainRes,
    });
  }
  return res;
};

const lookupSdkInSmaliSrc = async (folderPath: string, trackingSdk: SdkSearchLocation): Promise<string | undefined> =>
  new Promise(async (resolve, reject) => {
    for (const index in trackingSdk.versionSearchLocations) {
      const versionLocation = trackingSdk.versionSearchLocations[index];
      debug('checking #', index, '=>', versionLocation.filePathWildcard);

      //find files to search inside for version number
      glob(
        versionLocation.filePathWildcard,
        {
          cwd: folderPath,
        },
        async (err: Error | null, matches: string[]) => {
          //files that match the search wildcard
          debug('matches: ', index, '=>', matches);

          let version = undefined;

          for (let matchPath of matches) {
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
  if (!!stringToSearch && stringToSearch.length > 0) {
    //string was not found, the file is not what we're looking for
    if (!stringExistInFile(filePath, stringToSearch)) {
      debug('the string ' + stringToSearch + ' was not found in ' + filePath, ' >>> aborting !!!');
      return undefined;
    }
  }

  //at this point all required strings where found in the file
  //aka, we found the file we're looking for
  debug('now searching for version name');
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

const stringExistInFile = async (filePath: string, stringToSearch: string): Promise<boolean> => {
  //todo: optimize, stop searching when finding the first occurrence
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
